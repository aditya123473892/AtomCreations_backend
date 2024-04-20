const Coupondb = require("../models/couponModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupondb.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupondb.find();
        res.json(coupons);
    } catch (error) {
        throw new Error(error);
    }
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updateCoupon = await Coupondb.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedCoupon = await Coupondb.findByIdAndDelete(id);
        res.json(deletedCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

const getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const coupon = await Coupondb.findById(id);
        res.json(coupon);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createCoupon,
    getAllCoupons,
    deleteCoupon,
    updateCoupon,
    getCoupon,
};
