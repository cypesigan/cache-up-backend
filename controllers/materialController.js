const Material = require("../models/Materials");

// GET /api/materials
const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    const formatted = materials.map((m) => {
      const obj = m.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch materials", error: error.message });
  }
};

// POST /api/materials
const createMaterial = async (req, res) => {
  try {
    const data = req.body;
    if (data.id && !data._id) data._id = data.id;
    const item = await Material.create(data);
    const obj = item.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to create material", error: error.message });
  }
};

// PUT /api/materials/:id
const updateMaterial = async (req, res) => {
  try {
    const item = await Material.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Material not found" });
    const obj = item.toObject();
    obj.id = obj._id;
    res.status(200).json(obj);
  } catch (error) {
    res.status(400).json({ message: "Failed to update material", error: error.message });
  }
};

// DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const item = await Material.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Material not found" });
    res.status(200).json({ message: "Material deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete material", error: error.message });
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
