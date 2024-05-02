const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const { UserNotFound, errorHandler } = require("./middlewares/errorHandling");
const app = express();
const path = require("path");
const cloudinary = require("cloudinary").v2;
const PORT = process.env.PORT || 4000;
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const couponRouter = require("./routes/couponRoutes");
const razorpayRouter = require("./routes/razorpayRoutes");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dbConnect();
// app.use("/",(req,res)=>{
//     res.send("Hello ")
// })

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const cors = require("cors");
const corsOption = {
  origin: ["https://atomcreations.co"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));

app.use("/api/user", authRouter);
app.use("/api/appuser", userRouter);
app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/payment", razorpayRouter);

app.get("/api/payment/getkey", (req, res) =>
  res.status(200).json(process.env.RAZORPAY_API_KEY)
);

app.use(UserNotFound);
app.use(errorHandler);

cloudinary.config({
  secure: true,
});
console.log(cloudinary.config());

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
