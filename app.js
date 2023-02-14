require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const helmet = require("helmet");
const http = require('http');
const { stringify } = require('querystring');
const jwt = require("jsonwebtoken");
const path = require('path')

const auth = require('./middleware/auth');

const userRoutes = require('./routes/user');
const blogRoutes = require('./routes/blog');
const contactRoute = require('./routes/contact');


// mongo DB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_SECRET,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

// cors
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  'credentials': true,
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'allowedHeaders': ['sessionId', 'Content-Type', 'Authorization', '*'],
  'exposedHeaders': ['sessionId'],
  'preflightContinue': false
}
app.use(cors(corsOptions));
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
// helmet
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// cookie parser
app.use(cookieParser());

// jwt
app.get('/jwt', auth, (req, res, next) => {
  res.status(200).send(res.auth);
  next();
})

app.use("/api/contact", contactRoute)
app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);
app.use("/uploads", express.static('uploads'))


module.exports = app;