const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connected succesfully");
  } catch (error) {
    console.log("database error");
  }
};

module.exports = dbConnect;
