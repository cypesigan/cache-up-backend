const User = require("../models/User");

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "email"];
    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (typeof updates.name === "string") updates.name = updates.name.trim();
    if (typeof updates.email === "string") updates.email = updates.email.trim().toLowerCase();

    const updatedFields = Object.keys(updates);

    if (updatedFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Update DB
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated",
      updatedFields,
      user,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email is already in use" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile };