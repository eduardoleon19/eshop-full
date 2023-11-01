const express = require("express")
const path = require("path")
const User = require("../model/user");
const router = express.Router();
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const fs = require("fs");
const jwt =require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/auth");
const Product = require("../model/product")
const Shop = require("../model/shop")
const Order = require("../model/order");


//create a new order
router.post(
"/create-order", catchAsyncErrors(async(req, res, next) => {
    try {
        const {cart, shippingAddress, user, totalPrice, paymentInfo} = req.body
        //group cart items by shopId
        const shopItemsMap = new Map();

        for(const item of cart) {
            const shopId = item.shopId
            if(!shopItemsMap.has(shopId)) {
                shopItemsMap.set(shopId, [])
            }
            shopItemsMap.get(shopId).push(item)
        }

        //create an order for each shop
        const orders = []

        for (const [shopId, items] of shopItemsMap) {
            const order = await Order.create({
                cart: items,
                shippingAddress,
                user,
                totalPrice,
                paymentInfo,
            })
            orders.push(order)
        }

        res.status(201).json({
            success: true,
            orders,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})
)

module.exports = router;
