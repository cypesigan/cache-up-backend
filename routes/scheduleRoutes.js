const express = require("express");
const router = express.Router();
const { getSchedules, updateSchedule } = require("../controllers/scheduleController");
const { protect } = require("../middleware/authMiddleware");
const { allowSelfOr } = require("../middleware/accessMiddleware");

router.get("/", getSchedules);
router.put("/:userId", protect, allowSelfOr("userId", "admin"), updateSchedule);

module.exports = router;