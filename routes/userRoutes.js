const express = require("express");
const router = express.Router();
const {
  getUsers,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.patch("/:id/status", updateUserStatus);
router.patch("/:id", updateUserProfile);
router.delete("/:id", deleteUser);

module.exports = router;
