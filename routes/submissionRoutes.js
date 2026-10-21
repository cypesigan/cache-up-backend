const express = require("express");
const router = express.Router();
const {
  getSubmissions,
  submitAssignment,
  gradeSubmission,
} = require("../controllers/submissionController");

router.get("/", getSubmissions);
router.post("/", submitAssignment);
router.patch("/:id/grade", gradeSubmission);

module.exports = router;
