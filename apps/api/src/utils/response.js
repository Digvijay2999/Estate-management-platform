export function successResponse(res, statusCode = 200, payload = {}, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    message,
    ...payload,
  });
}

export function errorResponse(res, statusCode = 500, message = 'Something went wrong', code = 'INTERNAL_ERROR') {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}
