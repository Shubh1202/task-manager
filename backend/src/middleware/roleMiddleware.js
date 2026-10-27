const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control Middleware
 *
 * Restricts route access to specific user roles.
 * Must be used AFTER the `protect` middleware so that req.user is set.
 *
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'employee')
 * @returns {Function} Express middleware
 *
 * @example
 * router.post('/admin-only', protect, restrictTo('admin'), handler);
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`
        )
      );
    }
    next();
  };
};

module.exports = { restrictTo };
