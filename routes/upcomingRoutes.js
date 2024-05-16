const express = require("express");
const { createUpcomingProduct, getUpcomingProd } = require("../controller/productCtrl");
const router = express.Router();
router.post("/", createUpcomingProduct);
router.get("/", getUpcomingProd);

module.exports = router;