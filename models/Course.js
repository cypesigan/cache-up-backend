const mongoose = require("mongoose");

const syllabusUnitSchema = new mongoose.Schema(
  {
    unit: { type: String, default: "Unit 1" },
    title: { type: String, default: "Foundations" },
    lessons: { type: Number, default: 3 },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `crs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    instructorId: {
      type: String,
      ref: "User",
    },
    instructorName: {
      type: String,
      default: "Instructor",
    },
    instructorAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    },
    level: {
      type: String,
      default: "Beginner level",
    },
    duration: {
      type: String,
      default: "8 Weeks",
    },
    totalLessons: {
      type: Number,
      default: 6,
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    color: {
      type: String,
      default: "#1e3f33",
    },
    badge: {
      type: String,
      default: "Popular",
    },
    thumbnail: {
      type: String,
      default: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=600&q=80",
    },
    description: {
      type: String,
      trim: true,
    },
    schedule: {
      type: String,
      default: "TBD",
    },
    room: {
      type: String,
      default: "Online",
    },
    syllabus: {
      type: [syllabusUnitSchema],
      default: [],
    },
    customLessons: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    students: [
      {
        type: String,
        ref: "User",
      },
    ],
    teacher: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
