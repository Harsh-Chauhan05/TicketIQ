/**
 * Standardized API Response Helpers
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const error = (res, message = 'Something went wrong', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};

const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

module.exports = { success, error, validationError };
