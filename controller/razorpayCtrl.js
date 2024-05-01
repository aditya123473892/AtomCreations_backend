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
  console.log(orderId);

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here
    // const order = await Orderdb.findById(orderId);
    // console.log(order);

    await razorpaydb.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    console.log(razorpay_order_id);
    console.log(razorpay_payment_id);
    console.log(razorpay_signature);
    // order.paymentInfo.razorpay_order_id = razorpay_order_id;
    // order.paymentInfo.razorpay_payment_id = razorpay_payment_id;
    // order.paymentInfo.razorpay_signature = razorpay_signature;
    // order.isConfirmed = true

    const order = await Orderdb.findOneAndUpdate(
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
    await order.save();
    console.log(order);

    res.redirect(
      `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
    );

    console.log(razorpay_order_id);
    console.log(razorpay_payment_id);
    console.log(razorpay_signature);
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

module.exports = {
  checkout,
  paymentVerification,
};
