const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    prompt: { type: String, required: true },
    points: { type: Number, default: 10 },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `quiz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    courseId: {
      type: String,
      ref: "Course",
      required: true,
    },
    courseName: {
      type: String,
      default: "Course",
    },
    unitIdx: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    dueDate: {
      type: String,
      default: () => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
    dueTime: {
      type: String,
      default: "11:59 PM",
    },
    duration: {
      type: String,
      default: "20 minutes",
    },
    timeLimitMinutes: {
      type: Number,
      default: 20,
    },
    passingScorePercent: {
      type: Number,
      default: 70,
    },
    totalPoints: {
      type: Number,
      default: 40,
    },
    status: {
      type: String,
      default: "Active",
    },
    publishedAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
