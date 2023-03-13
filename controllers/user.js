const UserModel = require("../models/user");
const ObjectID = require("mongoose").Types.ObjectId;
const { signUpErrors, signInErrors } = require("../middleware/errors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { transporter, newSignUpRequest, signUpRequestReceived, resetPasswordLink, mailValidAccepted } = require("../utils/emails")
const {generateAccessToken, generateRefreshToken} = require("../utils/generateTokens");

exports.signup = async (req, res) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const email = req.body.email.trim();
  const { password } = req.body;

  const mailOne = newSignUpRequest(email, firstName, lastName)
  const mailTwo = signUpRequestReceived(email, firstName, lastName)

  try {
    await UserModel.create({ firstName, lastName, email, password });
    await Promise.all([transporter.sendMail(mailOne), transporter.sendMail(mailTwo)]);
    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(200).json({ errors });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    const refreshToken = await generateRefreshToken(user);
    const accessToken = await generateAccessToken(user);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'None' });
    res.cookie('accessToken', accessToken, { httpOnly: true,  secure: true, sameSite: 'None' });
    res.status(200).json({ message: "Utilisateur log" })
  } catch (err) {
    const errors = signInErrors(err);
    console.log(err)
    res.status(200).json({ errors });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(200).json({ message: "logout success" })
};

exports.forgotpassword = async (req, res) => {
  const { email } = req.body;

  UserModel.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(200).json({ message: "Email not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const userObject = {
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000, // 1 hour
    };

    UserModel.findOneAndUpdate(
      { email },
      { ...userObject },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).then((user) => {
      user.save().then(() => {
        const mail3 = resetPasswordLink(email, token)
        transporter.sendMail(mail3, (error) => {
          if (error) {
            return res.status(500).json({ message: "Error sending email" });
          }
          res.json({
            message:
              "An email has been sent to " +
              email +
              " with further instructions.",
          });
        });
      });
    });
  });
};

exports.getResetToken = async (req, res) => {
  UserModel.findOne({ resetPasswordToken: `${req.params.token}` }).then(
    (user) => {
      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }
      res.json({ email: user.email });
    }
  );
};

exports.updatePassword = async (req, res) => {
  const { password } = req.body;

  UserModel.findOne({ resetPasswordToken: `${req.params.token}` }).then(
    (user) => {
      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      const userObject = {
        password: password,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      };

      UserModel.findOneAndUpdate(
        { resetPasswordToken: `${req.params.token}` },
        { ...userObject },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).then((user) => {
        user.save().then(() => {
          res.json({ message: "Password changed successfully" });
        });
      });
    }
  );
};

exports.getAllUsers = (req, res) => {
  UserModel.find()
    .select("-password")
    .then((users) => res.status(200).json(users))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneUser = (req, res) => {
  UserModel.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};

exports.updateUser = async (req, res) => {

  const { email, firstName } = req.body

  console.log(isAdmin)

  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const userObject = req.file
    ? {
        ...req.body,
        imageUrl:
          req.file !== null ? "uploads/profil/" + `${req.file.filename}` : "",
      }
    : { ...req.body };

  if (req.body.isAccepted == "true") {

    const mailValidAccepted = mailValidAccepted(email, firstName);

    await transporter.sendMail(mailValidAccepted, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

  if (isAdmin === true) {
    UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { ...userObject },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

      .then((data) => res.send(data + "L'utilisateur a bien été modifié"))
      .catch((err) => res.status(500).send({ message: err }));
  } else {
    {
      res.status(401).json({
        message: "Vous n'êtes pas authorisé à modifier cet utilisateur!",
      });
    }
  }
};

exports.deleteUser = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  if (isAdmin === true) {
    UserModel.findOneAndDelete({ _id: req.params.id })
      .then(() => {
        res.status(200).json({ message: "Compte supprimé !" });
      })
      .catch((error) => res.status(401).json({ message: "Non-authorisé" }));
  } else {
    {
      res.status(401).json({
        message: "Vous n'êtes pas authorisé à supprimer cet utilisateur!",
      });
    }
  }
};