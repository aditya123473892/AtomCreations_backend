const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCategory,
  getallCategory,
  updateCategory,
  deleteCategory,
  getCategory,
} = require("../controller/categoryCtrl");

router.post("/", authMiddleware, isAdmin, createCategory);
router.get("/", getallCategory);
router.get("/:id", getCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

module.exports = router;
