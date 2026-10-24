const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    assignmentId: {
      type: String,
      ref: "Assignment",
      required: [true, "Assignment ID is required"],
    },
    assignmentTitle: {
      type: String,
      default: "Assignment",
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
      required: [true, "Student ID is required"],
    },
    studentName: {
      type: String,
      default: "Student",
    },
    studentAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
    submissionDate: {
      type: String,
      default: () => new Date().toISOString().replace("T", " ").slice(0, 16),
    },
    submissionType: {
      type: String,
      default: "file",
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    linkUrl: {
      type: String,
      trim: true,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Submitted", "Graded", "submitted", "graded"],
      default: "Submitted",
    },
    score: {
      type: Number,
      default: null,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    feedback: {
      type: String,
      default: "",
    },
    rubricScores: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    gradedBy: {
      type: String,
      default: null,
    },
    gradedAt: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
