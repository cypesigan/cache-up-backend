const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");

// Requires a valid Bearer token belonging to an approved account. Sets req.user.
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: please log in" });
    }

    let decoded;
    try {
      decoded = jwt.verify(header.slice(7), JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Your session has expired. Please log in again." });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "This account no longer exists" });
    if (user.status !== "approved") {
      return res.status(403).json({ message: "This account is not approved" });
    }

    req.user = {
      id: String(user._id),
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      assignedCourseIds: user.assignedCourseIds || [],
    };
    next();
  } catch (error) {
    next(error);
  }
};

// Usage: router.post("/", protect, restrictTo("teacher", "admin"), handler)
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do that" });
    }
    next();
  };

module.exports = { protect, restrictTo };
