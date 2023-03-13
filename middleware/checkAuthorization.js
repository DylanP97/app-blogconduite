const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        let accessToken = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
            const isAdmin = decoded.userId.isAdmin;
            next(isAdmin);
        } catch (error) {
            res.clearCookie("accessToken")
            res.clearCookie("refreshToken")
            res.status(401).json({ message: 'Invalid access token' });
        }
    } else {
        res.status(401).json({ message: 'Access token not found' });
    }
};