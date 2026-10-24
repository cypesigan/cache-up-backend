const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  addReply,
} = require("../controllers/announcementController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get("/", getAnnouncements);
router.post("/", restrictTo("teacher", "admin"), createAnnouncement);
router.post("/:id/replies", addReply); // any logged-in user can comment
router.put("/:id", restrictTo("teacher", "admin"), updateAnnouncement);
router.delete("/:id", restrictTo("teacher", "admin"), deleteAnnouncement);

module.exports = router;
