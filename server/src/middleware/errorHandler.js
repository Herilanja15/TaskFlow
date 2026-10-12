function errorHandler(error, _request, response, _next) {
  const clientErrorStatus =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 500
      ? error.status
      : undefined;
  const statusCode =
    error.statusCode ||
    (error.code === 11000 ? 409 : undefined) ||
    clientErrorStatus ||
    (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    message: statusCode === 500
      ? 'An unexpected error occurred'
      : error.type === 'entity.parse.failed'
        ? 'Invalid JSON body'
      : error.code === 11000
        ? 'An account with this email already exists'
        : error.message,
  });
}

export default errorHandler;