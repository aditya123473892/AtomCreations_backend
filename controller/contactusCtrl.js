const nodemailer = require("nodemailer");
asyncHandler = require("express-async-handler");

const contactUsMail = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: data.from,
    to: process.env.MAIL_ID,
    subject: data.subject,
    text: data.text,
    html: data.htm,
  });

  console.log("Message sent: %s", info.messageId);
});

const contactUs = asyncHandler(async (req, res) => {
  const { email, message,senderName } = req.body;
  try {
    if (!email || !message) {
      throw new Error("email and message are required");
    } else {
      const data = {
        // from: email,
        from:`"${senderName}" <${email}>`,
        text: message,
        subject: "Atom Creations Contact us",
        htm: message,
      };
      await contactUsMail(data);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

module.exports = contactUs;
