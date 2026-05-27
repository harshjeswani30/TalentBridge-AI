/**
 * Role-based access guard middleware factory.
 * @param  {...string} roles - allowed roles e.g. 'student', 'company'
 */
const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This action requires one of: [${roles.join(', ')}] role.`,
      });
    }

    next();
  };
};

module.exports = { roleGuard };
