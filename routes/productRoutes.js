const express = require("express");
const {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    createUpcomingProduct,
    getUpcomingProd,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/",authMiddleware,isAdmin, createProduct);
router.get("/:id", getProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.get("/", getAllProducts);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);


// router.post("/typography", createUpcomingProduct)

module.exports = router;
