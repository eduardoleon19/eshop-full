const express = require("express")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const router = express.Router();
const Product = require("../model/product")
const Shop = require("../model/shop")
const { upload } = require("../multer")
const ErrorHandler = require("../utils/ErrorHandler");
const { isSellerToken } = require("../middleware/auth");
const fs = require("fs");



//create product
router.post("/create-product", upload.array("images"), catchAsyncErrors(async(req, res, next) => {
    try {
        const shopId = req.body.shopId
        const shop = await Shop.findById(shopId);
        if(!shop) {
            return next(new ErrorHandler("Shop Id is invalid!", 400))
        } else {
            const files = req.files
            const imageUrls = files.map((file) => `${file.filename}`)
            const productData = req.body
            productData.images = imageUrls;
            productData.shop = shop;

            const product = await Product.create(productData);
            
            res.status(201).json({
                success: true,
                product,
            })
        }
    } catch (error) {
        return next(new ErrorHandler)
    }
}))

//get allproducts of a shop
router.get("/get-all-products-shop/:id", catchAsyncErrors(async(req, res, next) => {
    try {
        const allProducts = await Product.find({shopId: req.params.id})
        res.status(201).json({
            success:true,
            allProducts,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

//delete product of a shop
router.delete("/delete-shop-product/:id", isSellerToken, 
catchAsyncErrors(async(req, res, next) => {
    try {
        const productId = req.params.id
        const product = await Product.findByIdAndDelete(productId)

        if (!product) {
            return next(new ErrorHandler("Product not found with this id", 500))
        }

        product.images.forEach((urlImage) => {
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
            message: "Product Deleted successfully!",
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

// products
router.get("/get-products", catchAsyncErrors(async(req, res, next) => {
    try {
        const someProducts = await Product.find().sort({sold_out: 1}).limit(10)
        res.status(201).json({
            success:true,
            someProducts,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

//top 10 products products by cateogry
router.get("/get-products-category/:catego", catchAsyncErrors(async(req, res, next) => {
    try {
        const productsByCategory = await Product.find({category: req.params.catego}).sort({sold_out: 1}).limit(10)
        res.status(201).json({
            success:true,
            productsByCategory,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

//get a product for id
router.get("/get-products-ids/:id", catchAsyncErrors(async(req, res, next) => {
    try {
        const productById = await Product.findById({_id: req.params.id})
        res.status(201).json({
            success:true,
            productById,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

//top 5 best deals
router.get("/get-best-deals", catchAsyncErrors(async(req, res, next) => {
    try {
        const bestDeals = await Product.find().sort({sold_out: -1}).limit(5)
        res.status(201).json({
            success:true,
            bestDeals,
        })
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }
}))

module.exports = router;