const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const User = require("../models/User");
const makeCrud = require("../utils/crud");
const { serialize, clientId, sendError } = require("../utils/http");

const crud = makeCrud(Quiz, "Quiz", {
  filterKeys: ["courseId"],
  onDeleted: (id) => QuizSubmission.deleteMany({ quizId: id }),
});

// GET /api/quizzes/submissions
const getQuizSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.quizId === "string" && req.query.quizId) filter.quizId = req.query.quizId;
    if (req.user.role === "student") {
      filter.studentId = req.user.id; // students only ever see their own attempts
    } else if (typeof req.query.studentId === "string" && req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    const subs = await QuizSubmission.find(filter).sort({ createdAt: -1 });
    res.status(200).json(subs.map(serialize));
  } catch (error) {
    sendError(res, error, "Failed to fetch quiz submissions");
  }
};

// POST /api/quizzes/submit   (students) - the server does the marking, the client's score is ignored.
const submitQuizAttempt = async (req, res) => {
  try {
    const body = req.body || {};
    const quiz = typeof body.quizId === "string" ? await Quiz.findById(body.quizId) : null;
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const given = body.answers && typeof body.answers === "object" ? body.answers : {};
    const answers = {}; // only keep answers for real questions
    let earnedScore = 0;
    let possible = 0;
    for (const q of quiz.questions) {
      const points = Number(q.points) || 10;
      possible += points;
      if (given[q.id] === undefined) continue;
      answers[q.id] = Number(given[q.id]);
      if (answers[q.id] === q.correctOptionIndex) earnedScore += points;
    }
    const maxScore = quiz.totalPoints || possible || 100;
    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 100;
    const passed = percentage >= (quiz.passingScorePercent || 70);

    const student = await User.findById(req.user.id);
    const data = {
      quizId: quiz._id,
      quizTitle: quiz.title,
      courseId: quiz.courseId,
      courseName: quiz.courseName,
      studentId: req.user.id,
      studentName: student?.name || req.user.name,
      studentAvatar: student?.avatar || req.user.avatar,
      submittedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      answers,
      score: earnedScore,
      maxScore,
      percentage,
      passed,
      timeSpent: typeof body.timeSpent === "string" ? body.timeSpent.slice(0, 40) : "Completed",
    };
    const id = clientId(body);
    if (id) data._id = id;

    const sub = await QuizSubmission.create(data);
    res.status(201).json(serialize(sub));
  } catch (error) {
    sendError(res, error, "Failed to record quiz submission");
  }
};

module.exports = {
  getQuizzes: crud.list,
  createQuiz: crud.create,
  updateQuiz: crud.update,
  deleteQuiz: crud.remove,
  getQuizSubmissions,
  submitQuizAttempt,
};
