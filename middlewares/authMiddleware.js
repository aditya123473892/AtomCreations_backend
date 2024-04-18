//verify jwt token

const Userdb = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await Userdb.findById(decoded?._id);
        req.user = user;
        next();
      }
    } catch (err) {
      throw new Error("Not authorized.. token expired, Please login again");
    }
  } else {
    throw new Error("No token found in the header");
  }
});


//check if admin

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await Userdb.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("Not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
