const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    authorName: { type: String, default: "User" },
    authorRole: { type: String, default: "student" },
    authorAvatar: { type: String, default: "" },
    date: { type: String, default: () => new Date().toISOString().replace("T", " ").slice(0, 16) },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

// Field names match what the frontend reads (authorName, authorRole, isRead, replies ...).
const announcementSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `anc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    // A course id, or "all" for academy-wide announcements
    courseId: {
      type: String,
      default: "all",
    },
    courseName: {
      type: String,
      default: "All Courses & Academy Wide",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    authorName: {
      type: String,
      default: "Instructor",
    },
    authorRole: {
      type: String,
      default: "Course Instructor",
    },
    authorAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    },
    date: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      default: "Normal",
    },
    // Read state is tracked per browser by the frontend; this is only the initial value.
    isRead: {
      type: Boolean,
      default: false,
    },
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
