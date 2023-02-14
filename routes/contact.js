const router = require("express").Router();
const nodemailer = require("nodemailer");
const auth = require('../middleware/auth');

router.post('/', async (req, res) => {

    const transporter = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.GMAIL_USER}`,
        pass: `${process.env.PASSWORD}`,
      }
    }, );
  
    const mailContact = {
      from: `${req.body.email}`,
      to: `${process.env.GMAIL_USER}`,
      subject: `${req.body.firstName} vous a contacté`,
      html: `<div style="background: #ececec;>
              <h3 style="padding: 20px; width: 100%">${req.body.firstName} vous a contacté depuis son interface. Voici son message:</h3>
              <br/>
              <p>${req.body.message}</p>
            </div>`
    }
  
    await transporter.sendMail(mailContact, function(error, info){
      if (error) {
        res.status(500).json({ error });
      }
      else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Email bien envoyé' });
      }
    })
  });
  

module.exports = router;