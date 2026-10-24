const User = require("../models/User");
const { serialize, sendError } = require("../utils/http");

// Fields a user may change on their own profile.
const SELF_FIELDS = ["name", "avatar", "title", "bio", "department", "phone", "enrolledCourseIds"];
// Admins may additionally change these on any user. Passwords are never changed through this route.
const ADMIN_FIELDS = [
  ...SELF_FIELDS,
  "role",
  "status",
  "email",
  "studentId",
  "points",
  "gpa",
  "streakDays",
  "studyHours",
  "assignedCourseIds",
  "registrationNotes",
  "joinedDate",
];
// Hidden from students when they look at other people.
const PRIVATE_FIELDS = ["email", "phone", "studentId", "registrationNotes"];

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const isStaff = req.user.role === "admin" || req.user.role === "teacher";
    const users = await User.list(isStaff ? {} : { status: "approved" });

    const result = users.map((u) => {
      const obj = serialize(u);
      if (!isStaff && obj._id !== req.user.id) {
        for (const key of PRIVATE_FIELDS) delete obj[key];
      }
      return obj;
    });
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error, "Failed to fetch users");
  }
};

// PATCH /api/users/:id/status   (admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    if (req.params.id === req.user.id && status !== "approved") {
      return res.status(400).json({ message: "You cannot change your own approval status" });
    }

    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "User not found" });

    const set = { status };
    if (status === "approved" && existing.role === "student" && (!existing.title || existing.title === "Prospective Student")) {
      set.title = "Enrolled Student";
    }

    const user = await User.update(req.params.id, set);
    res.status(200).json(serialize(user));
  } catch (error) {
    sendError(res, error, "Failed to update user status");
  }
};

// PATCH /api/users/:id   (the user themself, or an admin)
const updateUserProfile = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const isSelf = req.params.id === req.user.id;
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "You can only edit your own profile" });
    }

    const allowed = isAdmin ? ADMIN_FIELDS : SELF_FIELDS;
    const body = req.body || {};
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
    }

    if (isSelf && "role" in updates && updates.role !== req.user.role) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No editable fields were provided" });
    }

    const user = await User.update(req.params.id, updates);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(serialize(user));
  } catch (error) {
    sendError(res, error, "Failed to update user profile");
  }
};

// DELETE /api/users/:id   (admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.remove(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User removed successfully", id: req.params.id });
  } catch (error) {
    sendError(res, error, "Failed to delete user");
  }
};

module.exports = { getUsers, updateUserStatus, updateUserProfile, deleteUser };
