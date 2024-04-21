// // const forgotPasswordToken = asyncHandler(async (req, res) => {
// //     const { email } = req.body;
// //     const user = await Userdb.findOne({ email: email });
// //     console.log(user);
// //     if (!user) {
// //       throw new Error("User not found");
// //     }
// //     try {
// //       const token = await user.createPasswordResetToken();
// //       await user.save();
// //       const resetURL = `Hi, Follow this link to reset your Password. This link will be valid for 10 minutes from now. <a href='http://localhost:8080/api/user/reset-password/${token}'>Click Here</>`;
// //       const data = {
// //         to: email,
// //         text: "Hey!!",
// //         subject: "Reset Password",
// //         htm: resetURL,
// //       };
// //       sendEmail(data);
// //       res.json(token);
// //     } catch (error) {
// //       throw new Error(error);
// //     }
// //   });
// asyncHandler = require("express-async-handler");

const otpGenerator = require("otp-generator");
const otpGenerate = () => {
  return otpGenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets:false, specialChars: false });
};
// otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

module.exports = otpGenerate;
