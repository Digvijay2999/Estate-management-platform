export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
    code: error.code ?? 'INTERNAL_ERROR',
  });
}
