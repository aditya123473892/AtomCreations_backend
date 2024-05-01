const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    // country: {
    //     type: String,
    //     required: true,
    // },
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        // _id: false,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      size: {
        type: String,
        required: true,
      },
      ProductsTitle: {
        type: String,
      },
      ProductsPrice: {
        type: String,
      },
    },
  ],

  paymentInfo: {
    id: {
      type: String,
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_payment_id: {
      type: String,
    },
    razorpay_signature: {
      type: String,
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    status: {
      type: String,
      default: "processing",
    },
    paidAt: {
      type: Date,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 50.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    couponAvailable: {
      type: Boolean,
      default: false,
    },
    couponValue: {
      type: Number,
      default: 0.0,
    },
    couponCode: {
      type: String,
    },
    orderStatus: {
      type: String,
      required: true,
      default: "processing",
    },
    deliveredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
});

orderSchema.pre("save", function (next) {
  if (this.paymentInfo.paymentMethod === "razorpay") {
    this.paymentInfo.razorpay_order_id = ""; // Set default values
    this.paymentInfo.razorpay_payment_id = "";
    this.paymentInfo.razorpay_signature = "";
  } else {
    delete this.paymentInfo.razorpay_order_id;
    delete this.paymentInfo.razorpay_payment_id;
    delete this.paymentInfo.razorpay_signature;
  }
  next();
});
module.exports = mongoose.model("Order", orderSchema);
