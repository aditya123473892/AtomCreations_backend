const nodemailer = require("nodemailer");
asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    // service:"gmail",
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "ceo@atomcreations.co",
      pass: "Atomcreations@123",
    },
  // const transporter = nodemailer.createTransport({    
  //   host: "smtpout.secureserver.net",  
  //   secure: true,
  //   secureConnection: false, // TLS requires secureConnection to be false
  //   tls: {
  //       ciphers:'SSLv3'
  //   },
  //   requireTLS:true,
  //   port: 465,
  //   debug: true,
  //   auth: {
  //         user: process.env.MAIL_ID,
  //         pass: process.env.MAIL_PASS,
  //       },

  });
  

  let info = await transporter.sendMail({
    from: `"Atom Creations" <${process.env.MAIL_ID}>`, // sender address

    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.htm, // html body
  });

  console.log("Message sent: %s", info.messageId);
});

module.exports = sendEmail;
