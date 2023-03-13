require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { stringify } = require("querystring");
const jwt = require("jsonwebtoken");
const path = require("path");

const auth = require("./middleware/checkAuthorization");

const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const contactRoute = require("./routes/contact");
const UserModel = require("./models/user");
const { generateAccessToken } = require("./utils/generateTokens");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_SECRET, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["sessionId", "Content-Type", "Authorization", "*"],
  exposedHeaders: ["sessionId"],
  preflightContinue: false,
};
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser());


app.get('/api/verifyRefreshToken', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const decodedAccessToken = jwt.decode(req.cookies.accessToken, { complete: true });
    const expirationTime = decodedAccessToken?.payload.exp;

    if (!req.cookies.accessToken) {
      console.log("no access token found, issue a new one")
      const accessToken = await generateAccessToken(decoded.userId);
      res.cookie('accessToken', accessToken, { httpOnly: true });
      res.status(200).json({ userId: decoded.userId._id, isAdmin: decoded.userId.isAdmin, accessToken: `${accessToken}` })
    } else if (Date.now() >= expirationTime * 1000) {
      console.log("access token has expired, issue a new one")
      const accessToken = await generateAccessToken(decoded.userId);
      res.cookie('accessToken', accessToken, { httpOnly: true });
      res.status(200).json({ userId: decoded.userId._id, isAdmin: decoded.userId.isAdmin, accessToken: `${accessToken}` })
    } else {
      res.status(200).json({ userId: decoded.userId._id, isAdmin: decoded.userId.isAdmin, accessToken: `${req.cookies.accessToken}` })
    }
  } catch (error) {
    res.clearCookie("refreshToken")
    res.status(400).json(error);
  }
});


app.use("/api/contact", contactRoute);
app.use("/api/user", userRoutes);
app.use("/api/blog", blogRoutes);
app.use("/uploads", express.static("uploads"));

module.exports = app;