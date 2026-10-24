const Assignment = require("../models/Assignment");

// GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }
    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });
    const formatted = assignments.map((a) => {
      const obj = a.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments", error: error.message });
  }
};

// POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const data = req.body;
    if (data.id && !data._id) {
      data._id = data.id;
    }
    const newAsg = await Assignment.create(data);
    const obj = newAsg.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to create assignment", error: error.message });
  }
};

// PUT /api/assignments/:id
const updateAssignment = async (req, res) => {
  try {
    const asg = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!asg) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    const obj = asg.toObject();
    obj.id = obj._id;
    res.status(200).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to update assignment", error: error.message });
  }
};

// DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
  try {
    const asg = await Assignment.findByIdAndDelete(req.params.id);
    if (!asg) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ message: "Assignment deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete assignment", error: error.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
