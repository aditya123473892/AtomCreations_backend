const mongoose = require("mongoose");

var TypographySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      fit: {
        type: String,
      },
      fabric: {
        type: String,
      },
      length: {
        type: String,
      },
      mainTrend: {
        type: String,
      },
      neck: {
        type: String,
      },
      occasion: {
        type: String,
      },
      pattern: {
        type: String,
      },
      sleeveLength: {
        type: String,
      },
      sleeveStyling: {
        type: String,
      },
      sustainable: {
        type: String,
      },
      washCare: {
        type: String,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      default: "Atom Creations",
    },
    images: {
      type: Array,
    },
    color: {
      type: Array,
      required: true,
    },
    size: {
      type: Array,
      required: true,
    },
    ratings: [
      {
        star: Number,
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("typography", TypographySchema);
