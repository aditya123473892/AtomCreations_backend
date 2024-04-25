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
  getOrder,
  getUserOrders,
  addAddress,
  getAddress,
  deleteAddress,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  confirmOrder,
} = require("../controller/userCtrl");
const contactUs = require("../controller/contactuscTRL.JS");

router.post("/addtocart", authMiddleware, addToCart);
router.get("/getcartitem", authMiddleware, getCartItems);
router.post("/addToWishlist", authMiddleware, addToWishlist);
router.get("/getwishlist", authMiddleware, getWishlist);
router.put("/removefromwishlist", authMiddleware, removeFromWishlist);
router.put("/incquantity", authMiddleware, increaseQuantity);
router.put("/decquantity", authMiddleware, decreaseQuantity);
router.post("/emptycart", authMiddleware, emptyCart); //
router.put("/removefromcart", authMiddleware, removeFromCart);
router.post("/placeorder", authMiddleware, placeOrder);
router.get("/getorder/:orderId", authMiddleware, getOrder);
router.get("/getuserorders", authMiddleware, getUserOrders);
router.put("/applyCoupon/:orderId", authMiddleware, applyCoupon);
router.put("/confirmOrder",authMiddleware,confirmOrder)
router.post("/addAdress", authMiddleware, addAddress);
router.get("/getaddress", authMiddleware, getAddress);
router.put("/deleteAddress", authMiddleware, deleteAddress);

router.post("/contactus",contactUs)
module.exports = router;
