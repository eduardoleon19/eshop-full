const express = require("express")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const router = express.Router();
const Product = require("../model/product")
const Shop = require("../model/shop")
const Event = require("../model/event")
const { upload } = require("../multer")
const ErrorHandler = require("../utils/ErrorHandler");
const { isSellerToken } = require("../middleware/auth");
const fs = require("fs");

//create event
router.post("/create-event", upload.array("images"), catchAsyncErrors(async(req, res, next) => {
    try {
        const shopId = req.body.shopId
        const shop = await Shop.findById(shopId);
        if(!shop) {
            return next(new ErrorHandler("Shop Id is invalid!", 400))
        } else {
            const files = req.files
            const imageUrls = files.map((file) => `${file.filename}`)
            const eventData = req.body
            eventData.images = imageUrls;
            eventData.shop = shop;

            const product = await Event.create(eventData);
            
            res.status(201).json({
                success: true,
                product,
            })
        }
    } catch (error) {
        return next(new ErrorHandler)
    }
}))

router.get("/get-whole-events", catchAsyncErrors(async (req, res, next) => {
    try {
        const now = new Date()
        const wholeEvents = await Event.find({endDate: {$gt: now}})

        res.status(201).json({
            success: true,
            wholeEvents,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))


//get allevents of a shop
router.get("/get-all-events-shop/:id", catchAsyncErrors(async(req, res, next) => {
    try {
        const allEvents = await Event.find({shopId: req.params.id})
        res.status(201).json({
            success:true,
            allEvents,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

//delete product of a event shop
router.delete("/delete-shop-event/:id", isSellerToken, 
catchAsyncErrors(async(req, res, next) => {
    try {
        const productId = req.params.id
        const event = await Event.findByIdAndDelete(productId)

        if (!event) {
            return next(new ErrorHandler("Event not found with this id", 500))
        }

        event.images.forEach((urlImage) => {
            const filePath = `uploads/${urlImage}`
            fs.unlink(filePath, (err) => {
                if(err){
                    console.log(err);
                    //res.status(500).json({message: "Error deleting file"});
                }
            })
        })
        
        res.status(201).json({
            success:true,
            message: "Event Deleted successfully!",
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

module.exports = router;