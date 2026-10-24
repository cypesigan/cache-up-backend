const Schedule = require("../models/Schedule");

// GET /api/schedule
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find();
    // Return map: { [userId]: { title, items } }
    const result = {};
    schedules.forEach((s) => {
      result[s._id] = {
        title: s.title,
        items: s.items || [],
      };
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schedules", error: error.message });
  }
};

// PUT /api/schedule/:userId
const updateSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, items } = req.body;

    const updated = await Schedule.findByIdAndUpdate(
      userId,
      {
        _id: userId,
        userId,
        title: title || "Schedule",
        items: items || [],
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      title: updated.title,
      items: updated.items,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to update schedule", error: error.message });
  }
};

module.exports = {
  getSchedules,
  updateSchedule,
};
