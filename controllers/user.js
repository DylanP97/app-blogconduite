const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { signUpErrors, signInErrors } = require("../middleware/errors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const threeDays = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.RANDOM_TOKEN_SECRET, {
    expiresIn: threeDays,
  });
};

exports.signup = async (req, res, next) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const email = req.body.email.trim();
  const { password } = req.body;

  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.GMAIL_USER}`,
      pass: `${process.env.PASSWORD}`,
    },
  });

  const mailOptions = {
    from: `${email}`,
    to: `${process.env.GMAIL_USER}`,
    subject: `Nouvelle demande d'inscription de ${firstName} ${lastName}`,
    html: ` <div>
              <h3>Un utilisateur a fait une demande d'inscription :</h3>
              <div style="padding: 20px">
                <p style="margin: 0px 0px 5px 0px">${firstName} ${lastName}</p>
                <p style="margin: 0px 0px 5px 0px">${email}</p>
                <p style="margin: 0px 0px 5px 0px">Vérifiez avec cet utilisateur son identité</p>
              </div>
            </div>`,
  };

  const mailOptions2 = {
    from: `${process.env.GMAIL_USER}`,
    to: `${email}`,
    subject: `Bonjour ${firstName}! Votre demande d'inscription a bien été reçue`,
    html: ` <div>
              <p>Votre demande d'inscription a bien été reçue.
              Nous reviendrons très rapidement vers vous pour valider votre inscription.</p>
            </div>`,
  };

  const user = await UserModel.findOne({ email: email });

  var requestSuccess;

  try {
    await UserModel.create({ firstName, lastName, email, password });
    res.status(201).json({ message: "Utilisateur créé !" });
    requestSuccess = true;
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(200).json({ errors });
    requestSuccess = false;
  }

  if (requestSuccess) {
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    await transporter.sendMail(mailOptions2, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.auth = user._id;
    res.cookie("jwt", token, {
      httpOnly: false,
      sameSite: "None",
      secure: "true",
      threeDays
    });
    res.status(200).json({ user: user._id, jwt: token });
  } catch (err) {
    const errors = signInErrors(err);
    res.status(200).json({ errors });
  }
};

exports.logout = (req, res, next) => {

  res.clearCookie('jwt');
  res.redirect('/');

  // const token = req.cookies.jwt
  // res.locals.user = null;
  // res.cookie('jwt', token, { maxAge: 1 });
  // res.status(200).json({ message: "user logged out" });
};

exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;
  // Check if the email exists in the database
  UserModel.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(200).json({ message: "Email not found" });
    }

    // Generate a password reset token
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
      // Save the token and expiration date to the database
      user.save().then(() => {
        // Send a password reset email to the user
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: `${process.env.GMAIL_USER}`,
            pass: `${process.env.PASSWORD}`,
          },
        });

        const mailOptions = {
          from: `${process.env.GMAIL_USER}`,
          to: email,
          subject: "Réinitialisation de votre mot de passe.",
          text:
            "Vous recevez ceci parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n" +
            "Veuillez cliquer sur le lien suivant ou le coller dans votre navigateur pour terminer le processus :\n\n" +
            `${process.env.FRONTEND_URL}/reset/${token}` +
            " " +
            "Si vous ne l'avez pas demandé, veuillez ignorer cet e-mail et votre mot de passe restera inchangé.\n",
        };

        transporter.sendMail(mailOptions, (error) => {
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

exports.getResetToken = async (req, res, next) => {
  // Find the user in the database with the matching reset token and expiration date
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

exports.updatePassword = async (req, res, next) => {
  const { password } = req.body;

  // Find the user in the database
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
        // Save the updated user to the database
        user.save().then(() => {
          res.json({ message: "Password changed successfully" });
        });
      });
    }
  );
};


exports.getAllUsers = (req, res, next) => {
  UserModel.find()
    .select("-password")
    .then((users) => res.status(200).json(users))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneUser = (req, res, next) => {
  UserModel.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};

exports.updateUser = async (req, res, next) => {
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.GMAIL_USER}`,
      pass: `${process.env.PASSWORD}`,
    },
  });

  const mailValidAccepted = {
    from: `${process.env.GMAIL_USER}`,
    to: `${req.body.email}`,
    subject: `Bonjour ${req.body.firstName}, votre inscription a été validé`,
    html: ` <div style="background: #ececec;">
              <h3 style="padding: 20px; width: 100%">Votre demande d'inscription vient d'être valider</h3>
            </div>`,
  };

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
    await transporter.sendMail(mailValidAccepted, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

  if (res.auth.isAdmin === true) {
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

exports.deleteUser = (req, res, next) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  if (res.auth.isAdmin === true) {
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
