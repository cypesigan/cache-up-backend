const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

const staff = [protect, authorize("teacher", "admin")];

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", staff, createCourse);
router.put("/:id", staff, updateCourse);
router.delete("/:id", staff, deleteCourse);

module.exports = router;