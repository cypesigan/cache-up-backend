const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const { serialize, clientId, sendError } = require("../utils/http");

const SUBMITTABLE_FIELDS = ["submissionType", "content", "linkUrl", "fileName", "fileSize", "fileUrl"];

// GET /api/submissions
const getSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.assignmentId === "string" && req.query.assignmentId) filter.assignmentId = req.query.assignmentId;
    if (typeof req.query.courseId === "string" && req.query.courseId) filter.courseId = req.query.courseId;
    if (req.user.role === "student") {
      filter.studentId = req.user.id; // students only ever see their own work
    } else if (typeof req.query.studentId === "string" && req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    const subs = await Submission.find(filter).sort({ createdAt: -1 });
    res.status(200).json(subs.map(serialize));
  } catch (error) {
    sendError(res, error, "Failed to fetch submissions");
  }
};

// POST /api/submissions   (students)
const submitAssignment = async (req, res) => {
  try {
    const body = req.body || {};
    const assignment = typeof body.assignmentId === "string" ? await Assignment.findById(body.assignmentId) : null;
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const student = await User.findById(req.user.id);
    const data = {
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      courseId: assignment.courseId,
      courseName: assignment.courseName,
      maxScore: assignment.maxScore,
      // Identity always comes from the logged-in account, never from the request body.
      studentId: req.user.id,
      studentName: student?.name || req.user.name,
      studentAvatar: student?.avatar || req.user.avatar,
      status: "Submitted",
      score: null,
    };
    for (const key of SUBMITTABLE_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const id = clientId(body);
    if (id) data._id = id;

    const sub = await Submission.create(data);
    res.status(201).json(serialize(sub));
  } catch (error) {
    sendError(res, error, "Failed to submit assignment");
  }
};

// PATCH /api/submissions/:id/grade   (teachers / admins)
const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback, rubricScores } = req.body || {};
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Submission not found" });

    const numericScore = Math.round(Number(score));
    if (!Number.isFinite(numericScore) || numericScore < 0) {
      return res.status(400).json({ message: "Score must be a number of 0 or more" });
    }
    if (numericScore > (sub.maxScore ?? 100)) {
      return res.status(400).json({ message: `Score cannot be higher than ${sub.maxScore ?? 100}` });
    }

    sub.score = numericScore;
    sub.feedback = typeof feedback === "string" ? feedback : "";
    if (rubricScores !== undefined) sub.rubricScores = rubricScores;
    sub.status = "Graded";
    sub.gradedBy = req.user.name; // taken from the logged-in grader, not the request body
    sub.gradedAt = new Date().toISOString().replace("T", " ").slice(0, 16);
    await sub.save();

    res.status(200).json(serialize(sub));
  } catch (error) {
    sendError(res, error, "Failed to grade submission");
  }
};

module.exports = { getSubmissions, submitAssignment, gradeSubmission };
