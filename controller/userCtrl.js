const { generatetoken } = require("../config/jwtToken");
const Userdb = require("../models/userModel");
const Orderdb = require("../models/orderModel");
const Productdb = require("../models/productModel");
// const Productdb = require("../models/productModel");
const Coupondb = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongooseId = require("../utils/validateMongodbId");
const { generateRefeshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("../controller/emailCtrl");
const crypto = require("crypto");
const { sendJwt } = require("../utils/sendJWT");
const otpGenerate = require("./sendotpCtrl");
//register

const sendOtp = asyncHandler(async (req, res) => {
  const email = req.body.email;
  try {
    const findUser = await Userdb.findOne({ email: email });
    if (findUser && findUser.isVerified) {
      throw new Error("User Already Exists");
    } else if (findUser && !findUser.isVerified) {
      const otp = otpGenerate();
      console.log(otp);

      const data = {
        to: email,
        text: `Verify your email.. OTP is ${otp}`,
        subject: "OTP Verification",
        htm: `Please verify your email address. <br> OTP IS ${otp}`,
      };
      sendEmail(data);
      console.log(data);
      
      findUser.otp = otp
      await findUser.save()
      res.json(findUser)
      res.json(otp);

    } else {
      const otp = otpGenerate();
      console.log(otp);

      const data = {
        to: email,
        text: `Verify your email.. OTP is ${otp}`,
        subject: "OTP Verification",
        htm: `Please verify your email address. <br> OTP IS ${otp}`,
      };
      sendEmail(data);
      const newUser = await Userdb.create({
        ...req.body,
        otp: otp,
      });

      sendJwt(res, newUser, `User created`);
      res.json(newUser);

      res.json(otp);
    }

    // const newUser = await Userdb.create(req.body);

    // res.json({message:"mail sent"})
    // res.json(newUser);
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

// const sendOtp = asyncHandler(async (req, res) => {
//   const email = req.body.email;
//   try {
//     const findUser = await Userdb.findOne({ email: email });
//     if (findUser) {
//       if (findUser.isVerified) {
//         throw new Error("User Already Exists");
//       } else {
        
//         const otp = otpGenerate();
//         console.log(otp);
//         const data = {
//           to: email,
//           text: `Verify your email.. OTP is ${otp}`,
//           subject: "OTP Verification",
//           htm: `Please verify your email address. <br> OTP IS ${otp}`,
//         };
//         user.otp = otp
//         sendEmail(data);
//         // user.otp = otp
//         res.json(otp);
//       }
//     } else {
//       // User does not exist, create user with OTP and send email
//       const otp = otpGenerate();
//       console.log(otp);
//       const data = {
//         to: email,
//         text: `Verify your email.. OTP is ${otp}`,
//         subject: "OTP Verification",
//         htm: `Please verify your email address. <br> OTP IS ${otp}`,
//       };
//       sendEmail(data);
//       const newUser = await Userdb.create({
//         ...req.body,
//         otp: otp,
//       });
//       sendJwt(res, newUser, `User created`);
//       res.json(newUser);
//     }
//   } catch (error) {
//     res.status(500).json({
//       msg: "Internal Server Error",
//       success: false,
//       error: error.message,
//     });
//   }
// });

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await Userdb.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not present" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    user.isVerified = true;
    await user.save();
    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

//login
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await Userdb.findOne({ email: email });
  if (
    findUser &&
    findUser.isVerified &&
    (await findUser.isPasswordMatched(password))
  ) {
    // const refreshToken = await generateRefeshToken(findUser?._id);
    // const updateUser = await Userdb.findByIdAndUpdate(
    //     findUser._id,
    //     {
    //         refreshToken: refreshToken,
    //     },
    //     { new: true }
    // );

    // res.cookie("token", refreshToken, {
    //     httpOnly: true,
    //     maxAge: 72 * 60 * 60 * 1000,
    // });
    sendJwt(res, findUser, `User found`);
    // res.json({
    //     _id: findUser?._id,
    //     name: findUser?.name,
    //     email: findUser?.email,
    //     mobile: findUser?.mobile,
    //     token: generatetoken(findUser?._id),
    // });
  } else {
    throw new Error("Invalid Credentials");
  }
});

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = await req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken);
  const user = await Userdb.findOne({ refreshToken });
  if (!user) {
    throw new Error("No refresh token");
  }
  jwt.verify(refreshToken, process.env.JWT_KEY, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("Something went wrong with refresh token");
    }
    const accessToken = generatetoken(user?._id);
    res.json({ accessToken });
  });
});

//Logout

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await Userdb.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //forbidden
  }
  await Userdb.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); //forbidden
});

//get all users

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await Userdb.find();
    res.json(getUsers);
  } catch (err) {
    throw new Error(err);
  }
});

//get single user

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongooseId(id);
  console.log(id);
  try {
    const getUser = await Userdb.findById(id);
    res.json({
      getUser,
    });
  } catch (err) {
    throw new Error(err);
  }
});

//delete a user

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongooseId(id);

  try {
    const deleteUser = await Userdb.findByIdAndDelete(id);
    res.json({
      deleteUser,
    });
  } catch (err) {
    throw new Error(err);
  }
});

//Update a User
const updateUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  const { id } = req.user;
  validateMongooseId(id);

  try {
    const updatedUser = await Userdb.findByIdAndUpdate(
      id,
      {
        name: req?.body?.name,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );

    res.json(updatedUser);
  } catch (error) {
    throw new error(error);
  }
});

// Add item to cart

const addToCart = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongooseId(id);
  // const { token } = req.cookies;
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({
      success: false,
      message: "Product id required",
    });
  }
  // const decoded = jwt.verify(token, process.env.JWT_KEY);
  // req.user = await Userdb.findById(decoded._id);
  // const { id } = req.user;
  // validateMongooseId(id);
  try {
    const user = await Userdb.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not present" });
    }
    const product = await Productdb.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    console.log(product.price);
    const productIndex = user.cart.find(
      (item) => item._id.toString() === productId
    );
    console.log(productIndex);
    // const productIndex = user.cart.findIndex(
    //   (item) => item.toString() === productId
    // );

    if (productIndex) {
      return res.json({ message: "Product already exists in the cart" });
    } else {
      user.cart.push(productId);
    }

    await user.save();

    // Return success response
    res.json({ message: "Item added to cart successfully" });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});
const getCartItems = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongooseId(id);
  try {
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not present" });
    }
    const cart = user.cart;
    console.log(cart);
    const products = await Productdb.find({ _id: { $in: cart } });
    const cartItems = cart.map((itemId) => {
      const prodId = itemId._id;
      const product = products.find(
        (p) => p._id.toString() === prodId.toString()
      );
      const price = product.price * itemId.quantity;
      console.log(price);
      return {
        productId: itemId,
        productDetails: product,
        price: price,
      };
    });

    const totalprice = cartItems.reduce((total, item) => {
      return total + item.price;
    }, 0);
    console.log(totalprice);
    res.json({ cartItems: cartItems, totalprice: totalprice });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});
const emptyCart = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongooseId(id);
  try {
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not present" });
    }
    user.cart = [];
    await user.save();
    res.json({ message: "Cart emptied successfully" });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

// const removeFromCart = asyncHandler(async (req, res) => {
//   const { productId } = req.body;
//   if (!productId) {
//     res.status(400).json({
//       success: false,
//       message: "Product id required",
//     });
//   }
//   const { id } = req.user;
//   validateMongooseId(id);
//   try {
//     const user = await Userdb.findById(id);
//     if (!user) {
//       return res.status(404).json({ error: "User not present" });
//     }
//     user.cart = user.cart.filter((item) => item.toString() !== productId);

//     await user.save();
//     res.json({ message: "Item removed succesfully" });
//   } catch (error) {
//     res.status(500).json({
//       msg: "Internal Server Error",
//       success: false,
//       error: error.message,
//     });
//   }
// });

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({
      success: false,
      message: "Product id required",
    });
  }
  const { id } = req.user;
  validateMongooseId(id);
  try {
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not present" });
    }
    user.cart = user.cart.filter((item) => item._id.toString() !== productId);

    await user.save();
    res.json({ message: "Item removed succesfully" });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});
const increaseQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const { id } = req.user;
  validateMongooseId(id);

  try {
    // const user = await Userdb.findById(id);

    // if (!user) {
    //   return res.status(404).json({ error: "User not present" });
    // }
    // const cart = user.cart;
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not present" });
    }
    user.cart = user.cart.filter((item) => item.toString() !== productId);

    const cartItem = user.cart.find(
      (item) => item._id.toString() === productId
    );

    cartItem.quantity += 1;
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

const decreaseQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const { id } = req.user;
  validateMongooseId(id);

  try {
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not present" });
    }
    user.cart = user.cart.filter((item) => item.toString() !== productId);

    const cartItem = user.cart.find(
      (item) => item._id.toString() === productId
    );
    if (cartItem.quantity <= 0) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    cartItem.quantity -= 1;

    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});
// const placeOrder = asyncHandler(async (req, res) => {
//     const { token } = req.cookies;
//     const decoded = jwt.verify(token, process.env.JWT_KEY);
//     req.user = await Userdb.findById(decoded._id);
//     const { id } = req.user;
//     validateMongooseId(id);
//     try {
//         const user = req.user;
//         console.log(user);
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }
//         const data = req.body;
//         const {
//             address,
//             city,
//             phoneNo,
//             postalCode,
//             country,
//             orderItems,
//             paymentInfo,
//         } = data;
//         if (
//             !address ||
//             !city ||
//             !phoneNo ||
//             !postalCode ||
//             !country ||
//             !orderItems ||
//             !paymentInfo
//         ) {
//             return res.status(400).json({
//                 msg: "Complete all fields",
//                 success: false,
//             });
//         }

//         const finalItems = orderItems.map((item) => ({
//             product: item.productId,
//             quantity: item.quantity,
//         }));
//         console.log(orderItems);

//         // const totalPrice = calcPrice(orderItems);
//         const products = [];
//         for (const item of newOrder.orderItems) {
//             const product = await Productdb.findById(item.product);
//             if (product) {
//                 products.push(product);
//             }
//         }
//         console.log(products);
//         const totalPrice = orderItems.reduce((total, item) => {
//             // console.log(item);
//             const myItemId = Object.keys(item);
//             console.log(myItemId);
//             return total + (item.quantity * item.productId.price || 0);
//         }, 0);

//         const newOrder = new Orderdb({
//             shippingInfo: { address, city, phoneNo, postalCode, country },
//             user: user._id,
//             orderItems: finalItems,
//             paymentInfo: { ...paymentInfo, totalPrice },
//         });

//         await newOrder.save();

//         for (const item of newOrder.orderItems) {
//             const product = await Productdb.findById(item.product);
//             if (product) {
//                 products.push(product);
//             }
//         }
//         res.status(201).json({
//             msg: "Order created",
//             success: true,
//             data: newOrder,
//         });
//     } catch (error) {
//         res.status(500).json({
//             msg: "Internal Server Error",
//             success: false,
//             error: error.message,
//         });
//     }
// });
const placeOrder = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongooseId(id);
  try {
    // if (!token) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }

    // const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const data = req.body;
    const {
      address,
      city,
      phoneNo,
      postalCode,
      country,
      orderItems,
      paymentInfo,
    } = data;

    if (
      !address ||
      !city ||
      !phoneNo ||
      !postalCode ||
      !country ||
      !orderItems ||
      !paymentInfo
    ) {
      return res
        .status(400)
        .json({ msg: "Complete all fields", success: false });
    }

    const productIds = orderItems.map((item) => item.product);
    console.log(productIds);
    const products = await Productdb.find({ _id: { $in: productIds } });

    const totalPrice = orderItems.reduce((total, item) => {
      const product = products.find((p) => p._id.equals(item.product));
      return total + (product ? product.price * item.quantity : 0);
    }, 0);

    const finalItems = orderItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    const newOrder = new Orderdb({
      shippingInfo: { address, city, phoneNo, postalCode, country },
      user: user._id,
      orderItems: finalItems,
      paymentInfo: { ...paymentInfo, totalPrice },
    });
    await newOrder.save();

    res.status(201).json({
      msg: "Order created",
      success: true,
      data: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

//Block a User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongooseId(id);

  try {
    const blockUser = await Userdb.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockUser);
  } catch (error) {
    throw new Error(error);
  }
});

//Unblock a User

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongooseId(id);

  try {
    const blockUser = await Userdb.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User Unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

//update password

const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { password } = req.body;
  validateMongooseId(id);
  const user = await Userdb.findById(id);
  if (password) {
    user.password = password;
    const updatedPass = await user.save();
    res.json(updatedPass);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // const user = await Userdb.findOne({ email: email });
  // console.log(user);
  // if (!user) {
  //   throw new Error("User not found");
  // }
  try {
    const token = "abcd";
    // await user.save();
    const resetURL = `Hi, Follow this link to reset your Password. This link will be valid for 10 minutes from now. <a href='http://localhost:8080/api/user/reset-password/${token}'>Click Here</>`;
    const data = {
      to: email,
      text: "Hey!!",
      subject: "Reset Password",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await Userdb.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

//apply coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.body;
  const { orderId } = req.body;
  try {
    const { id } = req.user;
    validateMongooseId(id);

    const validCoupon = await Coupondb.findById(couponId);
    if (!validCoupon) {
      throw new Error("Invalid Coupon");
    }
    var order;
    if (orderId) {
      order = await Orderdb.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      let price = order.paymentInfo.totalPrice;
      price -= validCoupon.discount;

      order.paymentInfo.totalPrice = price;
      await order.save();
    }
  } catch (error) {
    throw new Error(error);
  }

  res.json(order);
});

module.exports = {
  sendOtp,
  loginUserCtrl,
  logout,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  addToCart,
  getCartItems,
  increaseQuantity,
  decreaseQuantity,
  emptyCart,
  removeFromCart,
  placeOrder,
  applyCoupon,
  verifyOtp,
};
