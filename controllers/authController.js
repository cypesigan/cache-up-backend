const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");
const { serialize, sendError } = require("../utils/http");

const str = (value, max = 500) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const publicUser = (user) => {
  const obj = serialize(user);
  delete obj.password;
  return obj;
};

// ==== REGISTER ====
const register = async (req, res) => {
  try {
    const { name, email, password, department, bio, phone, notes } = req.body || {};

    if (!str(name) || !str(email) || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const cleanEmail = str(email, 254).toLowerCase();
    const existing = await User.findByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const cleanName = str(name, 80);
    // New accounts are always students waiting for admin approval, whatever the client sends.
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: "student",
      status: "pending",
      studentId: `CU-${new Date().getFullYear()}-APP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: str(department, 120) || "School of Design & Creative Arts",
      bio: str(bio, 1000) || "New student seeking enrollment at CacheUp Academy.",
      phone: str(phone, 40) || "+1 (555) 000-0000",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`,
      registrationNotes: str(notes, 1000) || "Submitted online student registration form.",
    });

    res.status(201).json({
      message: "Registration successful. Your account is awaiting admin approval.",
      user: publicUser(user),
    });
  } catch (error) {
    sendError(res, error, "Registration failed");
  }
};

// ==== LOGIN ====
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findByEmail(email, { withPassword: true });

    // Same message for "no such user" and "wrong password" so accounts can't be enumerated.
    if (!user || !(await User.checkPassword(user, password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Registration pending admin approval. You cannot log in yet." });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your registration was not approved. Please contact administration." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user: publicUser(user) });
  } catch (error) {
    sendError(res, error, "Login failed");
  }
};

// ==== CURRENT USER (ME) ==== (route is behind `protect`)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    sendError(res, error, "Failed to load your account");
  }
};

// ==== CHANGE PASSWORD ==== (route is behind `protect`)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findByEmail(req.user.email, { withPassword: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!(await User.checkPassword(user, currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    await User.setPassword(user._id, newPassword); // hashed before it is stored
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    sendError(res, error, "Failed to change password");
  }
};

module.exports = { register, login, getMe, changePassword };
