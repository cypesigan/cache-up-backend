const express = require("express");
const router = express.Router();
const { getSubmissions, submitAssignment, gradeSubmission } = require("../controllers/submissionController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get("/", getSubmissions);
router.post("/", restrictTo("student"), submitAssignment);
router.patch("/:id/grade", restrictTo("teacher", "admin"), gradeSubmission);

module.exports = router;
