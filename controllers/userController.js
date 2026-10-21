const User = require("../models/User");

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const formatted = users.map((u) => {
      const obj = u.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// PATCH /api/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const obj = user.toObject();
    obj.id = obj._id;
    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

// PATCH /api/users/:id (update profile)
const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Do not update password via this route

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const obj = user.toObject();
    obj.id = obj._id;
    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user profile", error: error.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User removed successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
};
