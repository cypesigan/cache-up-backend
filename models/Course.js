const mongoose = require("mongoose");
const crypto = require("crypto");

const courseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Course code must be at most 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2500, "Description must be at most 2,500 characters"],
    },
    teacher: {
      type: String,
      ref: "User",
      required: [true, "Teacher is required"],
    },
    students: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);