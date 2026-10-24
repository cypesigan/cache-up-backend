const mongoose = require("mongoose");

// Field names match what the frontend reads (courseTitle, uploadDate, uploadedBy, downloadUrl, unitIdx).
const materialSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    courseId: {
      type: String,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    courseTitle: {
      type: String,
      default: "Course Material",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      default: "pdf",
    },
    size: {
      type: String,
      default: "1.0 MB",
    },
    unitIdx: {
      type: Number,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    uploadDate: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    // Display name of the uploader (e.g. "Prof. Alicia Mayer")
    uploadedBy: {
      type: String,
      default: "Instructor",
    },
    downloadUrl: {
      type: String,
      default: "#",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
