const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        let accessToken = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
            console.log(decoded)
            const isAdmin = decoded.userId.isAdmin;
            console.log(decoded.userId)
            res.auth.isAdmin = isAdmin;
            console.log(res.auth.isAdmin)
            next();
        } catch (error) {
            res.clearCookie("accessToken")
            res.clearCookie("refreshToken")
            res.status(401).json({ message: 'Invalid access token' });
        }
    } else {
        res.status(401).json({ message: 'Access token not found' });
    }
};