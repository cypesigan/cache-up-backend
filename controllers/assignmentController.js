const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const makeCrud = require("../utils/crud");

const crud = makeCrud(Assignment, "Assignment", {
  filterKeys: ["courseId"],
  // Removing an assignment also removes the work students handed in for it.
  onDeleted: (id) => Submission.deleteMany({ assignmentId: id }),
});

module.exports = {
  getAssignments: crud.list,
  createAssignment: crud.create,
  updateAssignment: crud.update,
  deleteAssignment: crud.remove,
};
