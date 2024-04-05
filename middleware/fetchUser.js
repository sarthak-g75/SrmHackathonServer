const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtSec = 'S@rth@KI$Th3B3$t'

const authMiddleware = async (req, res, next) => {
    // Get token from headers
    const token = req.header('Authorization');

    // Check if token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, jwtSec);
        // console.log(decoded)
        // Fetch user details from decoded token
        const user = await User.findById(decoded.userId);
        // console.log(user)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Attach user object to request object for further use
        req.user = user;
        next(); // Move to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
