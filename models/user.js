const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

let passwordRegExp = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{6,100}$');

const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 55,
      required: true
    },
    lastName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 55,
      required: true
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      validate: isEmail,
      required: true
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Number,
    },
    profileImg: {
      type: String,
      default: "./uploads/profil/default.png"
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true
    },
    isAccepted: {
      type: Boolean,
      default: false,
      required: true
    },
});


userSchema.pre("save", async function(next) {
  if (passwordRegExp.test(this.password)){
    let hash = await bcrypt.hash(this.password, 10);
    this.password = hash
  } else {
    throw Error('incorrect password');
  }
  next();
});


userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    console.log("User was found")
    if (user.isAccepted) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      } else {
        throw Error('incorrect password');
      }
    } else {
      throw Error('not accepted')
    }
  } else {
    throw Error('incorrect email')
  }
};

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;