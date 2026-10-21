const mongoose = require("mongoose");

const quizSubmissionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `qsub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    quizId: {
      type: String,
      ref: "Quiz",
      required: true,
    },
    quizTitle: {
      type: String,
      default: "Quiz",
    },
    courseId: {
      type: String,
      ref: "Course",
      default: "crs-1",
    },
    courseName: {
      type: String,
      default: "Course",
    },
    studentId: {
      type: String,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      default: "Student",
    },
    studentAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
    submittedAt: {
      type: String,
      default: () => new Date().toISOString().replace("T", " ").slice(0, 16),
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: String,
      default: "Completed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizSubmission", quizSubmissionSchema);
