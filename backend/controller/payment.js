const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const express = require("express")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const router = express.Router();
const Product = require("../model/product")
const Shop = require("../model/shop")
const { upload } = require("../multer")
const ErrorHandler = require("../utils/ErrorHandler");
const { isSellerToken } = require("../middleware/auth");
const fs = require("fs");

router.post("/payment/process", catchAsyncErrors(async(req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metadata: {
            company: "MyCompany"
        }
    })
    res.status(201).json({
        success: true,
        cliente_secret: myPayment.cliente_secret,
    })
}))

router.get("/stripeapikey", catchAsyncErrors(async(req, res, next) => {
    res.status(200).json({
        stripeApikey: process.env.STRIPE_API_KEY
    })
}))

module.exports = router