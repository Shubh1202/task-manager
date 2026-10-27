const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Authentication Middleware (protect)
 *
 * Verifies the Bearer JWT token from the Authorization header,
 * fetches the corresponding user from the database, and attaches
 * it to req.user for downstream handlers.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Access denied. No authorization token provided.'));
    }

    // Verify and decode the JWT
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(ApiError.unauthorized('Invalid or expired authorization token. Please log in again.'));
    }

    // Fetch active user from DB (exclude sensitive fields)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(ApiError.unauthorized('User belonging to this token no longer exists.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
