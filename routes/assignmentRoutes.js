const express = require("express");
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const staff = [protect, authorize("teacher", "admin")];

router.get("/", getAssignments);
router.post("/", staff, createAssignment);
router.put("/:id", staff, updateAssignment);
router.delete("/:id", staff, deleteAssignment);

module.exports = router;