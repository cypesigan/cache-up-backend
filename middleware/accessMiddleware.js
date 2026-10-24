// Allow if the logged-in user owns the resource (req.params[param]) or has one of the roles
// Usage: allowSelfOr("id", "admin")
const allowSelfOr = (param, ...roles) => (req, res, next) => {
  if (req.user.id === req.params[param] || roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: not your account" });
};

// Remove fields that must not be changed through PATCH /api/users/:id
const sanitizeUserUpdate = (req, res, next) => {
  if (!req.body) return next();

  // Nobody changes these here (password would skip bcrypt hashing with findByIdAndUpdate)
  delete req.body._id;
  delete req.body.password;

  // Only admins can change these
  if (req.user.role !== "admin") {
    delete req.body.role;
    delete req.body.status;
    delete req.body.assignedCourseIds;
  }
  next();
};

module.exports = { allowSelfOr, sanitizeUserUpdate };