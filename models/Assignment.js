const mongoose = require("mongoose");
const crypto = require("crypto");

const assignmentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    course: {
      type: String,
      ref: "Course",
      required: [true, "Course is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, "Instructions must be at most 2,000 characters"],
    },
    link: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    totalPoints: {
      type: Number,
      required: [true, "Total points is required"],
      min: [1, "Total points must be at least 1"],
      max: [1000, "Total points must be at most 1000"],
      default: 100,
    },
    createdBy: {
      type: String,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);