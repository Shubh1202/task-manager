const ApiError = require('../utils/ApiError');

/**
 * 404 Not Found Handler
 * Triggered when no route matches the incoming request.
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central Error Handler Middleware
 *
 * Handles all errors passed via next(err), including:
 *  - Custom ApiError instances (clean structured errors)
 *  - Mongoose CastError (invalid ObjectId)
 *  - Mongoose duplicate key errors (code 11000)
 *  - Mongoose ValidationError
 *  - JWT errors
 *  - Generic / unexpected server errors
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // ── Mongoose: Invalid ObjectId ──────────────────────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found. The ID "${err.value}" is not valid.`;
    errors = [];
  }

  // ── Mongoose: Duplicate Key ─────────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value for ${field}: "${value}". Please use a different value.`;
    errors = [{ field, message: `${field} must be unique.` }];
  }

  // ── Mongoose: Validation Error ──────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed. Please check your input.';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // ── JWT: Token Errors ───────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ── Build Response ──────────────────────────────────────────────────────────
  const responseBody = {
    success: false,
    message,
    ...(errors.length > 0 ? { errors } : {})
  };

  // Include stack trace only in non-production environments
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = { notFound, errorHandler };
