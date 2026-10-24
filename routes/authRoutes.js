const express = require("express");
const router = express.Router();
const { register, login, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const rateLimit = require("../middleware/rateLimit");

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: "Too many login attempts. Please wait a few minutes." });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: "Too many registrations. Please try again later." });

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, getMe);
router.put("/password", protect, changePassword);

module.exports = router;
