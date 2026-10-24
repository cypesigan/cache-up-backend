const Course = require("../models/Course");
const makeCrud = require("../utils/crud");
const { serialize, sendError } = require("../utils/http");

const crud = makeCrud(Course, "Course", { sort: { createdAt: 1 } });

// GET /api/courses/:id
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(serialize(course));
  } catch (error) {
    sendError(res, error, "Failed to fetch course");
  }
};

module.exports = {
  getCourses: crud.list,
  getCourseById,
  createCourse: crud.create,
  updateCourse: crud.update,
  deleteCourse: crud.remove,
};
