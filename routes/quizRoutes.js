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

router.get("/", getQuizzes);
router.post("/", createQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);
router.get("/submissions", getQuizSubmissions);
router.post("/submit", submitQuizAttempt);

module.exports = router;
