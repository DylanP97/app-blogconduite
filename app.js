require('dotenv').config()
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const jwt = require("jsonwebtoken");
const path = require('path')
// const helmet = require("helmet");
const { stringify } = require('querystring');
const nodemailer = require("nodemailer");

const auth = require('./middleware/auth');
const userRoutes = require('./routes/user');
const blogRoutes = require('./routes/blog');
const BlogModel = require("./models/blog");


// mongo DB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_SECRET,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


// cors, helmet, cookie parser
  
const app = express();
  
  
const corsOptions = {
  origin: '*',
  'credentials': true,
  'allowedHeaders': ['sessionId', 'Content-Type', 'Authorization', '*'],
  // 'exposedHeaders': ['sessionId'],
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}
app.use(cors(corsOptions));

app.use(express.static("public"))
app.use(express.urlencoded({ extended: false}))

app.use(bodyParser.json());
// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser());


// stripe
// const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
// const storeItems = new Map([
//   [1, { priceInCents: 900, name: 'Accès Apprentissage Conduite Alexandre'}],
//   [2, { priceInCents: 2000, name: 'Produit 2'}],
// ])
// app.post('/create-checkout-session', async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       line_items: req.body.items.map(item => {
//         const storeItem = storeItems.get(item.id)
//         return {
//           price_data: {
//             currency: 'eur',
//             product_data: {
//                 name: storeItem.name
//             },
//             unit_amount: storeItem.priceInCents
//           },
//           quantity: item.quantity
//         }
//       }),
//       success_url: `${process.env.FRONTEND_URL}/inscription`,
//       cancel_url:`${process.env.FRONTEND_URL}/inscription`,
//     })
//   res.json({ url: session.url })


//   } catch (e) {
//       res.status(500).json({ error: e.message })
//   }

// })

// jwt

app.get('/jwt', auth, (req, res, next) => {
  console.log(res.auth)
  res.status(200).send(res.auth);
  next();
})

app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);
app.use("/uploads", express.static('uploads'))

app.post('/api/contact', auth, async (req, res) => {

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

module.exports = app;