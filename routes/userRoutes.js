const express = require("express");
const router = express.Router();
const {
  getUsers,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { allowSelfOr, sanitizeUserUpdate } = require("../middleware/accessMiddleware");

router.get("/", getUsers);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.patch("/:id", protect, allowSelfOr("id", "admin"), sanitizeUserUpdate, updateUserProfile);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;