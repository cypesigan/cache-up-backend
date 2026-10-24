const express = require("express");
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get("/", getMaterials);
router.post("/", restrictTo("teacher", "admin"), createMaterial);
router.put("/:id", restrictTo("teacher", "admin"), updateMaterial);
router.delete("/:id", restrictTo("teacher", "admin"), deleteMaterial);

module.exports = router;
