const Announcement = require("../models/AnnouncementSchema");

// GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const items = await Announcement.find().sort({ createdAt: -1 });
    const formatted = items.map((a) => {
      const obj = a.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements", error: error.message });
  }
};

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const data = req.body;
    if (data.id && !data._id) data._id = data.id;
    const item = await Announcement.create(data);
    const obj = item.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to create announcement", error: error.message });
  }
};

// PUT /api/announcements/:id
const updateAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    const obj = item.toObject();
    obj.id = obj._id;
    res.status(200).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to update announcement", error: error.message });
  }
};

// DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete announcement", error: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
