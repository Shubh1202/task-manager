const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Login user (Admin or Employee) with Email and Password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest('Please provide both email and password.'));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      role: user.role
    });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return ApiResponse.ok({ token, user: userData }, 'Login successful.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return ApiResponse.ok({ user: req.user }, 'Profile retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe
};
