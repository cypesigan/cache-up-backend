const Announcement = require("../models/AnnouncementSchema");
const makeCrud = require("../utils/crud");
const { serialize, sendError } = require("../utils/http");

const crud = makeCrud(Announcement, "Announcement");

// POST /api/announcements/:id/replies   (any logged-in user)
const addReply = async (req, res) => {
  try {
    const content = typeof req.body?.content === "string" ? req.body.content.trim().slice(0, 2000) : "";
    if (!content) return res.status(400).json({ message: "Reply content is required" });

    const reply = {
      id: typeof req.body.id === "string" && req.body.id ? req.body.id.slice(0, 80) : `rep-${Date.now()}`,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar || "",
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      content,
    };

    const item = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: reply } },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    res.status(201).json(serialize(item));
  } catch (error) {
    sendError(res, error, "Failed to post reply");
  }
};

module.exports = {
  getAnnouncements: crud.list,
  createAnnouncement: crud.create,
  updateAnnouncement: crud.update,
  deleteAnnouncement: crud.remove,
  addReply,
};
