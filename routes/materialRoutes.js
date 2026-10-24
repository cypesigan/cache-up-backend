const express = require("express");
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");
const { protect, authorize } = require("../middleware/authMiddleware");

const staff = [protect, authorize("teacher", "admin")];

router.get("/", getMaterials);
router.post("/", staff, createMaterial);
router.put("/:id", staff, updateMaterial);
router.delete("/:id", staff, deleteMaterial);

module.exports = router;