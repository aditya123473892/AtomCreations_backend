const jwt = require("jsonwebtoken");

const sendJwt = (res, user, message, statusCode = 200) => {
    const token = user.getJWTToken();
    console.log("Token Sent");
    const options = {
        // token will expire in 3 days
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };

    res.status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            message: message || `${user.username} registered successfully`,
            user,
            token: token, // Include the token in the response
        });
};

module.exports = { sendJwt };
