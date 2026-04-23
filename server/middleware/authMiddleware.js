const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header first, then cookies
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return error(res, 'Not authorized — no token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user (select password explicitly excluded)
    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 'User not found', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return error(res, 'Account has been deactivated — contact your administrator', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired — please log in again', 401);
    }
    return error(res, 'Authorization failed', 401);
  }
};

module.exports = { protect };
