const express = require("express");
const router = express.Router();
const {
  loginUserCtrl,
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  sendOtp,
  verifyOtp,
  
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
router.post("/send-otp", sendOtp);
router.post("/verify-otp",verifyOtp)
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);

router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUserCtrl);
router.get("/getAllUser", getAllUsers);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/fetchuser", authMiddleware, getUser);
router.delete("/:id", deleteUser);
router.put("/updateUser", authMiddleware, updateUser);
router.put("/blockUser/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblockUser/:id", authMiddleware, isAdmin, unblockUser);
module.exports = router;
