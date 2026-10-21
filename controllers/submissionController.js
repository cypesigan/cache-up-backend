const Submission = require("../models/Submission");

// GET /api/submissions
const getSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.assignmentId) filter.assignmentId = req.query.assignmentId;
    if (req.query.courseId) filter.courseId = req.query.courseId;

    const subs = await Submission.find(filter).sort({ createdAt: -1 });
    const formatted = subs.map((s) => {
      const obj = s.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

// POST /api/submissions (submit assignment)
const submitAssignment = async (req, res) => {
  try {
    const data = req.body;
    if (data.id && !data._id) {
      data._id = data.id;
    }
    const newSub = await Submission.create(data);
    const obj = newSub.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to submit assignment", error: error.message });
  }
};

// PATCH /api/submissions/:id/grade
const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback, rubricScores, gradedBy } = req.body;
    const sub = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          score: parseInt(score, 10),
          feedback,
          rubricScores,
          status: "Graded",
          gradedBy: gradedBy || "Instructor",
          gradedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        },
      },
      { new: true }
    );
    if (!sub) {
      return res.status(404).json({ message: "Submission not found" });
    }
    const obj = sub.toObject();
    obj.id = obj._id;
    res.status(200).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to grade submission", error: error.message });
  }
};

module.exports = {
  getSubmissions,
  submitAssignment,
  gradeSubmission,
};
