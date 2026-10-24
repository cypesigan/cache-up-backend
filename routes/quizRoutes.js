const express = require("express");
const router = express.Router();
const {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
  submitQuizAttempt,
} = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

const staff = [protect, authorize("teacher", "admin")];

router.get("/", getQuizzes);
router.post("/", staff, createQuiz);
router.put("/:id", staff, updateQuiz);
router.delete("/:id", staff, deleteQuiz);
router.get("/submissions", getQuizSubmissions);
router.post("/submit", protect, authorize("student"), submitQuizAttempt);

module.exports = router;