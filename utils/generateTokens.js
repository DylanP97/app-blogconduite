const jwt = require("jsonwebtoken");

const generateAccessToken = async (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '30s' , sameSite: 'None' });
};

const generateRefreshToken = async (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' , sameSite: 'None' });
};

module.exports = { generateAccessToken, generateRefreshToken };