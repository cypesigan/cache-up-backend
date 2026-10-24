const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");

// GET /api/quizzes
const getQuizzes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    const formatted = quizzes.map((q) => {
      const obj = q.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
  }
};

// POST /api/quizzes
const createQuiz = async (req, res) => {
  try {
    const data = req.body;
    if (data.id && !data._id) data._id = data.id;
    const newQuiz = await Quiz.create(data);
    const obj = newQuiz.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to create quiz", error: error.message });
  }
};

// PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    const obj = quiz.toObject();
    obj.id = obj._id;
    res.status(200).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to update quiz", error: error.message });
  }
};

// DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    await QuizSubmission.deleteMany({ quizId: req.params.id });
    res.status(200).json({ message: "Quiz deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete quiz", error: error.message });
  }
};

// GET /api/quizzes/submissions
const getQuizSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.quizId) filter.quizId = req.query.quizId;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    const subs = await QuizSubmission.find(filter).sort({ createdAt: -1 });
    const formatted = subs.map((s) => {
      const obj = s.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quiz submissions", error: error.message });
  }
};

// POST /api/quizzes/submit
const submitQuizAttempt = async (req, res) => {
  try {
    const data = req.body;
    const quiz = await Quiz.findById(data.quizId);

    let earnedScore = 0;
    const maxScore = quiz?.totalPoints || data.maxScore || 100;

    if (quiz && quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((q) => {
        const studentChoice = data.answers?.[q.id];
        if (studentChoice !== undefined && studentChoice === q.correctOptionIndex) {
          earnedScore += Number(q.points) || 10;
        }
      });
    } else {
      earnedScore = Number(data.score) || 0;
    }

    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 100;
    const passed = percentage >= (quiz?.passingScorePercent || 70);

    const submissionData = {
      _id: data.id || `qsub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quizId: data.quizId,
      quizTitle: quiz ? quiz.title : (data.quizTitle || "Quiz Assessment"),
      courseId: quiz ? quiz.courseId : (data.courseId || "crs-1"),
      courseName: quiz ? quiz.courseName : (data.courseName || "Course"),
      studentId: data.studentId || "usr-1",
      studentName: data.studentName || "Student",
      studentAvatar: data.studentAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      submittedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      answers: data.answers || {},
      score: earnedScore,
      maxScore,
      percentage,
      passed,
      timeSpent: data.timeSpent || "Completed",
    };

    const newSub = await QuizSubmission.create(submissionData);
    const obj = newSub.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to record quiz submission", error: error.message });
  }
};

module.exports = {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
  submitQuizAttempt,
};
