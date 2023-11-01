const express = require("express")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const router = express.Router();
const Product = require("../model/product")
const Shop = require("../model/shop")
const Event = require("../model/event")
const { upload } = require("../multer")
const ErrorHandler = require("../utils/ErrorHandler");
const { isSellerToken } = require("../middleware/auth");
const CouponCode = require("../model/couponCode")
const fs = require("fs");

//create coupon code
router.post("/create-coupon-code", isSellerToken, catchAsyncErrors(async(req, res, next) => {
    try {
        const isCouponCodeExists = await CouponCode.find({
            name: req.body.name})

        if(isCouponCodeExists.length !== 0) {
            return next(new ErrorHandler("Coupon code already exists!", 400))
        }

        const couponCode = await CouponCode.create(req.body);

        res.status(201).json({
            success: true,
            couponCode,
        });
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

//get all coupons of a shop
router.get("/get-coupon/:id", isSellerToken, catchAsyncErrors(async(req, res, next) => {
    try {
        const couponCodes = await CouponCode.find({"shop._id": req.params.id})
        //const couponCodes = await CouponCode.find({name: "123"})
        //const couponCodes = await CouponCode.find({shop: {name: "WEBIWABO"}})

        //console.log("couponCodes", couponCodes)
        //console.log("req.params.id", req.params.id)
        
        res.status(201).json({
            success: true,
            couponCodes,
        })

    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

//delete coupon code
router.delete("/delete-coupon/:id", isSellerToken, catchAsyncErrors(async(req, res, next) => {
    try {
        const couponId = req.params.id
        const coupon = await CouponCode.findByIdAndDelete(couponId)

        if (!coupon) {
            return next(new ErrorHandler("Coupon code not found with this id!", 500))
        }

        res.status(201).json({
            success: true,
            message: "Coupon code has been deleted",
            coupon,
        })
    } catch (error) {

    }
}))

//get coupon code value by its name
router.get("/get-coupon-value/:name", catchAsyncErrors(async (req, res, next) => {
    try {
        const couponCode = await CouponCode.findOne({name: req.params.name})

        if (!couponCode) {
            return next(new ErrorHandler("Coupon code doesn´t exist!", 400))
        }

        res.status(201).json({
            success: true,
            couponCode,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 500))
    }
}))

module.exports= router;