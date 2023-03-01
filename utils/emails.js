const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.GMAIL_USER}`,
      pass: `${process.env.PASSWORD}`,
    },
  });


module.exports = transporter;