const mongoose = require("mongoose");
const crypto = require("crypto");

const submissionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    assignment: {
      type: String,
      ref: "Assignment",
      required: [true, "Assignment is required"],
    },
    student: {
      type: String,
      ref: "User",
      required: [true, "Student is required"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Content must be at most 5,000 characters"],
    },
    link: {
      type: String,
      trim: true,
    },
    grade: {
      type: Number,
      min: [0, "Grade cannot be negative"],
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, "Feedback must be at most 1,000 characters"],
    },
    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);