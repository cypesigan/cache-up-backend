const Material = require("../models/Materials");
const makeCrud = require("../utils/crud");

const crud = makeCrud(Material, "Material", { filterKeys: ["courseId"] });

module.exports = {
  getMaterials: crud.list,
  createMaterial: crud.create,
  updateMaterial: crud.update,
  deleteMaterial: crud.remove,
};
