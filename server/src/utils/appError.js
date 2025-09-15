class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;

    // this is the target object for stack trace
    // this.constructor tells V8 to exclude this constructor from the stack trace, so that when the error is logged, only the relevant parts of the code are not shown, not the internal AppError call.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
