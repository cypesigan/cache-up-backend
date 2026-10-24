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
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

// Fixed paths first, then the /:id routes
router.get("/submissions", getQuizSubmissions);
router.post("/submit", restrictTo("student"), submitQuizAttempt);

router.get("/", getQuizzes);
router.post("/", restrictTo("teacher", "admin"), createQuiz);
router.put("/:id", restrictTo("teacher", "admin"), updateQuiz);
router.delete("/:id", restrictTo("teacher", "admin"), deleteQuiz);

module.exports = router;
