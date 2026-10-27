/**
 * Standardized API Error Class
 *
 * Extends the native Error object to include HTTP status codes and structured
 * metadata for consistent error handling across the entire API surface.
 *
 * Usage: throw new ApiError(400, 'Validation failed.', ['Field errors...']);
 *        next(new ApiError(404, 'Task not found.'));
 */
class ApiError extends Error {
  /**
   * @param {number}   statusCode - HTTP status code (4xx / 5xx)
   * @param {string}   message    - Human-readable error description
   * @param {Array}    [errors]   - Optional array of detailed field/validation errors
   * @param {string}   [stack]    - Optional pre-built stack trace
   */
  constructor(statusCode, message = 'An unexpected error occurred.', errors = [], stack = '') {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ─── Convenience Factory Methods ────────────────────────────────────────────

  /** 400 Bad Request */
  static badRequest(message = 'Bad request.', errors = []) {
    return new ApiError(400, message, errors);
  }

  /** 401 Unauthorized */
  static unauthorized(message = 'Unauthorized. Please log in.') {
    return new ApiError(401, message);
  }

  /** 403 Forbidden */
  static forbidden(message = 'Forbidden. You do not have access to this resource.') {
    return new ApiError(403, message);
  }

  /** 404 Not Found */
  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(404, message);
  }

  /** 409 Conflict */
  static conflict(message = 'A conflict occurred with the current state of the resource.') {
    return new ApiError(409, message);
  }

  /** 422 Unprocessable Entity */
  static unprocessable(message = 'Validation failed.', errors = []) {
    return new ApiError(422, message, errors);
  }

  /** 500 Internal Server Error */
  static internal(message = 'Internal server error. Please try again later.') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
