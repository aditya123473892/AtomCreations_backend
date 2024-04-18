const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const { UserNotFound, errorHandler } = require("./middlewares/errorHandling");
const app = express();
const path = require("path");
const cors = require("cors")
const PORT = process.env.PORT || 4000;
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const couponRouter = require("./routes/couponRoutes");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
// const Razorpay = require("razorpay")

dbConnect();
// app.use("/",(req,res)=>{
//     res.send("Hello ")
// })

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// const cors = require("cors");
//  const corsOption = {
//   origin: ["https://atomcreations.co"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
// };
const corsOptions = {
  credentials: true,
  // origin: "*",
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors());

app.use("/api/user", authRouter);
app.use("/api/appuser", userRouter);
app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/coupon", couponRouter);
app.use(UserNotFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
