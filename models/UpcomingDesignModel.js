const mongoose = require("mongoose");

var UpcomingSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    images: {
        type: Array,
    },
},{
    timestamps: true,
})

module.exports = mongoose.model("upcomingProduct", UpcomingSchema);
