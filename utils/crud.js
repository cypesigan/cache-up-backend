const { serialize, cleanBody, clientId, sendError } = require("./http");

// Builds list/create/update/remove handlers for a simple collection.
// Authorization is applied in the route files, not here.
const makeCrud = (Model, label, { sort = { createdAt: -1 }, filterKeys = [], onDeleted } = {}) => ({
  list: async (req, res) => {
    try {
      const filter = {};
      for (const key of filterKeys) {
        // Only plain strings: blocks query-operator injection such as ?courseId[$ne]=x
        if (typeof req.query[key] === "string" && req.query[key]) filter[key] = req.query[key];
      }
      const items = await Model.find(filter).sort(sort);
      res.status(200).json(items.map(serialize));
    } catch (error) {
      sendError(res, error, `Failed to fetch ${label}s`);
    }
  },

  create: async (req, res) => {
    try {
      const data = cleanBody(req.body);
      const id = clientId(req.body);
      if (id) data._id = id;
      const item = await Model.create(data);
      res.status(201).json(serialize(item));
    } catch (error) {
      sendError(res, error, `Failed to create ${label}`);
    }
  },

  update: async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: cleanBody(req.body) },
        { new: true, runValidators: true }
      );
      if (!item) return res.status(404).json({ message: `${label} not found` });
      res.status(200).json(serialize(item));
    } catch (error) {
      sendError(res, error, `Failed to update ${label}`);
    }
  },

  remove: async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: `${label} not found` });
      if (onDeleted) await onDeleted(req.params.id);
      res.status(200).json({ message: `${label} deleted`, id: req.params.id });
    } catch (error) {
      sendError(res, error, `Failed to delete ${label}`);
    }
  },
});

module.exports = makeCrud;
