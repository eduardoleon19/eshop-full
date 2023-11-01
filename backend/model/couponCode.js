const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const couponCodeSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "Please enter your coupon code!"],
        unique: true,
        trim: true,
        match: [/^[A-Za-z0-9]+$/, "Not allow blanks and special character!"],
    },
    value: {
        type: Number,
        required: true,
    },
    minAmount: {
        type: Number,
    },
    maxAmount: {
        type: Number,
    },
    product: {
        id: {
            type: String,
        },
        name: {
            type: String,
        }
    },
    shop: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("CouponCode", couponCodeSchema)