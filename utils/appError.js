class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // operational errors or programming errors, we only process operational errors here

    // Error.captureStackTrace(this, this.constructor): This method is used to capture and store the stack trace for the current error object (this).
    // It takes two parameters: the error object and the constructor function to exclude from the stack trace.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
