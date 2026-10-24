const express = require("express");
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get("/", getAssignments);
router.post("/", restrictTo("teacher", "admin"), createAssignment);
router.put("/:id", restrictTo("teacher", "admin"), updateAssignment);
router.delete("/:id", restrictTo("teacher", "admin"), deleteAssignment);

module.exports = router;
