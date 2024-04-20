const mongoose = require('mongoose'); 

var couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    expiry:{
        type:Date,
        required:true,
    },
    discount:{
        type:Number,
        required:true,
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);