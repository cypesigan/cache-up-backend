const express = require("express");
const router = express.Router();
const { getSchedules, updateSchedule } = require("../controllers/scheduleController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getSchedules);
router.put("/:userId", updateSchedule); // owner or admin (checked in the controller)

module.exports = router;
