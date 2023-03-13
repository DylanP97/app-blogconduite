const router = require("express").Router();
const { transporter, contactMail } = require("../utils/emails")
const auth = require('../middleware/checkAuthorization');

router.post('/', auth, async (req, res) => {

  const { email, firstName, message } = req.body
  const mail1 = contactMail(email, firstName, message)
  
    await transporter.sendMail(mail1, function(error, info){
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