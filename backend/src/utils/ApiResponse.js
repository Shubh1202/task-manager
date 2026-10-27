/**
 * Standardized API Success Response Class
 *
 * Encapsulates a consistent success response structure across all API endpoints.
 * Usage: res.status(200).json(new ApiResponse(200, data, 'Success message'));
 */
class ApiResponse {
  /**
   * @param {number} statusCode   - HTTP status code (2xx)
   * @param {*}      data         - Response payload (object, array, or null)
   * @param {string} message      - Human-readable success message
   * @param {object} [meta]       - Optional metadata (pagination, counts, etc.)
   */
  constructor(statusCode, data, message = 'Request completed successfully.', meta = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (meta) {
      this.meta = meta;
    }
  }

  /**
   * Factory method – 200 OK
   */
  static ok(data, message = 'Request successful.', meta = null) {
    return new ApiResponse(200, data, message, meta);
  }

  /**
   * Factory method – 201 Created
   */
  static created(data, message = 'Resource created successfully.') {
    return new ApiResponse(201, data, message);
  }

  /**
   * Send the response using an Express res object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta ? { meta: this.meta } : {})
    });
  }
}

module.exports = ApiResponse;
