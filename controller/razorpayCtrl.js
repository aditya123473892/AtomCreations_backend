const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const validateMongooseId = require("../utils/validateMongodbId");
const razorpaydb = require("../models/paymentModel.js");
const Razorpay = require("razorpay");
const Orderdb = require("../models/orderModel");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});
const checkout = asyncHandler(async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});
const paymentVerification = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const { orderId } = req.params;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
     
      const updatedOrder = await Orderdb.findOneAndUpdate(
        { _id: orderId },
        {
          $set: {
            "paymentInfo.razorpay_order_id": razorpay_order_id,
            "paymentInfo.razorpay_payment_id": razorpay_payment_id,
            "paymentInfo.razorpay_signature": razorpay_signature,
            isConfirmed: true, 
          },
        },
        { new: true }
      );

     
      if (updatedOrder) {
        res.redirect(
          `https://atomcreations.co/paymentsuccess?reference=${razorpay_payment_id}`
        );
      } else {

        res.status(404).json({ success: false, message: "Order not found" });
      }
    } catch (error) {
     
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

module.exports = {
  checkout,
  paymentVerification,
};
