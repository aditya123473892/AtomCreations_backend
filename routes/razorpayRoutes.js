const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// import { paymentVerification, checkout } from "../controller/razorpayCtrl.js";
const { paymentVerification, checkout } = require("../controller/razorpayCtrl");
const router = express.Router();
router.post("/checkout", authMiddleware, checkout);

router.post("/paymentverification/:orderId", paymentVerification);
module.exports = router;

// export default router;
