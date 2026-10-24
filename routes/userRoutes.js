const express = require("express");
const router = express.Router();
const { getUsers, updateUserStatus, updateUserProfile, deleteUser } = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get("/", getUsers);
router.patch("/:id/status", restrictTo("admin"), updateUserStatus);
router.patch("/:id", updateUserProfile); // self or admin (checked in the controller)
router.delete("/:id", restrictTo("admin"), deleteUser);

module.exports = router;
