const mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema(
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
            type: String,
            required: true,
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

//Export the model
module.exports = mongoose.model("Product", ProductSchema);

// {
//   "name":"admin",
//   "email":"admin@gmail.com",
//   "password":"12345".
//   "mobile":"1234566789".
//   "role":"admin"
// }
