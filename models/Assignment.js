const mongoose = require("mongoose");

const rubricItemSchema = new mongoose.Schema(
  {
    criteria: { type: String, required: true },
    points: { type: Number, required: true },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `asg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    courseId: {
      type: String,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    courseName: {
      type: String,
      default: "Course",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    publishedAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    dueDate: {
      type: String,
      required: [true, "Due date is required"],
    },
    dueTime: {
      type: String,
      default: "11:59 PM",
    },
    duration: {
      type: String,
      default: "2 hours",
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    priorityColor: {
      type: String,
      default: "gold",
    },
    status: {
      type: String,
      default: "Pending",
    },
    rubric: {
      type: [rubricItemSchema],
      default: [],
    },
    submissionTypes: {
      type: [String],
      default: ["image", "pdf", "link"],
    },
    createdBy: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
