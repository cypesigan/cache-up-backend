const Schedule = require("../models/Schedule");
const { sendError } = require("../utils/http");

// GET /api/schedule  ->  { [userId]: { title, items } }
const getSchedules = async (req, res) => {
  try {
    const isStaff = req.user.role === "admin" || req.user.role === "teacher";
    // Students only get their own timetable plus the shared one.
    const filter = isStaff ? {} : { _id: { $in: [req.user.id, "global"] } };
    const schedules = await Schedule.find(filter);

    const result = {};
    schedules.forEach((s) => {
      result[s._id] = { title: s.title, items: s.items || [] };
    });
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error, "Failed to fetch schedules");
  }
};

// PUT /api/schedule/:userId   (the owner, or an admin)
const updateSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only edit your own schedule" });
    }

    const { title, items } = req.body || {};
    if (items !== undefined && !Array.isArray(items)) {
      return res.status(400).json({ message: "Schedule items must be a list" });
    }

    const updated = await Schedule.findOneAndUpdate(
      { _id: userId },
      { $set: { userId, title: typeof title === "string" && title ? title : "Schedule", items: items || [] } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ title: updated.title, items: updated.items });
  } catch (error) {
    sendError(res, error, "Failed to update schedule");
  }
};

module.exports = { getSchedules, updateSchedule };
