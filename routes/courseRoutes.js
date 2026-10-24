const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", restrictTo("teacher", "admin"), createCourse);
router.put("/:id", restrictTo("teacher", "admin"), updateCourse);
router.delete("/:id", restrictTo("teacher", "admin"), deleteCourse);

module.exports = router;
