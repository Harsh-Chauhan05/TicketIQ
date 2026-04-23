const { error } = require('../utils/apiResponse');

/**
 * requireRole('admin') or requireRole('admin', 'agent')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Not authenticated', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Access denied — requires role: ${roles.join(' or ')}`,
        403
      );
    }
    next();
  };
};

module.exports = { requireRole };
