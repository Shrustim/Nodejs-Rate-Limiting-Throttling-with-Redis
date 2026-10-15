export function errorHandler(
  error,
  req,
  res,
  next
) {
  const statusCode =
    error.statusCode || 500;

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message,
  });
}
