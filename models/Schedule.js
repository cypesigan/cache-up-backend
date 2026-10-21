const mongoose = require("mongoose");

const scheduleItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    courseId: { type: String, default: "" },
    course: { type: String, default: "" },
    title: { type: String, default: "" },
    code: { type: String, default: "" },
    days: { type: [String], default: [] },
    day: { type: String, default: "" },
    time: { type: String, default: "" },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    date: { type: String, default: "" },
    color: { type: String, default: "forest" },
    instructor: { type: String, default: "" },
    location: { type: String, default: "" },
    status: { type: String, default: "Upcoming" },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true, // e.g. "usr-1", "global"
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Weekly Schedule",
    },
    items: {
      type: [scheduleItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
