const jwt = require("jsonwebtoken")
const generatetoken = (id)=>{
    return jwt.sign({id},process.env.JWT_KEY,{expiresIn: "1d"})
}

module.exports = {generatetoken} 