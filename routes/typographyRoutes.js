const express = require("express");
const { createUpcomingProduct, getUpcomingProd, createTypography, getTypography } = require("../controller/productCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/",authMiddleware,isAdmin, createTypography);
router.get("/",getTypography);

module.exports = router;