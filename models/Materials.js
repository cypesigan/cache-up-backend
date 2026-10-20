const mongoose = require("mongoose");
const crypto = require("crypto");

const materialSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be at most 2,000 characters"],
    },
    link: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["document", "video", "link", "other"],
      default: "document",
    },
    uploadedBy: {
      type: String,
      ref: "User",
      required: [true, "Uploader is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);