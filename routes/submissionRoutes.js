const express = require("express");
const router = express.Router();
const {
  getSubmissions,
  submitAssignment,
  gradeSubmission,
} = require("../controllers/submissionController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getSubmissions);
router.post("/", protect, authorize("student"), submitAssignment);
router.patch("/:id/grade", protect, authorize("teacher", "admin"), gradeSubmission);

module.exports = router;