const express = require("express");
const router = express.Router();
const { getSchedules, updateSchedule } = require("../controllers/scheduleController");

router.get("/", getSchedules);
router.put("/:userId", updateSchedule);

module.exports = router;
