const globalErrorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Something went wrong!';

  console.error(`ERROR: ${message}`);

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = globalErrorHandler;
