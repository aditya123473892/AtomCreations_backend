const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
    addToCart,
    placeOrder,
    applyCoupon,
    emptyCart,
    removeFromCart,
    getCartItems,
    increaseQuantity,
    decreaseQuantity,
} = require("../controller/userCtrl");

router.post("/addtocart", authMiddleware, addToCart);
router.get("/getcartitem", authMiddleware, getCartItems);
router.put("/incquantity",authMiddleware, increaseQuantity);
router.put("/decquantity",authMiddleware, decreaseQuantity)
router.post("/emptycart", authMiddleware, emptyCart); //
router.put("/removefromcart", authMiddleware, removeFromCart);
router.post("/placeorder", authMiddleware, placeOrder);
router.put("/applyCoupon", authMiddleware, applyCoupon);
module.exports = router;
