const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt =require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const sendShopToken = require("../utils/shopToken");
const { isSellerToken } = require("../middleware/auth");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create shop
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  //console.log("1")
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });
    //console.log("email", email)
    //console.log("sellerEmail", sellerEmail)
    //console.log("req.file.filename", req.file.filename)
    if (sellerEmail) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file"})
        }
      });
      return next(new ErrorHandler("Seller already exists", 400));
    }
    const filename = req.file.filename;
    //console.log("filename", filename)
    const fileUrl = path.join(filename);
    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: fileUrl,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
    };

    const activationToken = createActivationToken(seller);
    const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

    try {
      await sendMail({
          email: seller.email,
          subject: "Activate your Shop",
          message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`
      })
      res.status(201).json({
          success: true,
          message: `please check your email ${seller.email} to activate your shop!`
      })
    }catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }

  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
      expiresIn: "5m",
  })
}

//activate seller
router.post("/activation", catchAsyncErrors(async(req, res, next)=> {
  //console.log("entro al router.post(/activation)")
  try {
      const {activation_token} = req.body;

      const newSeller = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
      
      if(!newSeller){
          return next(new ErrorHandler("Invalid token", 400));
      }
      const {name, email, password, avatar, zipCode, address, phoneNumber} = newSeller;

      let seller = await Shop.findOne({email});
      console.log("let user", seller)
      if (seller) {    
          return next(new ErrorHandler("Seller already exist", 400));
      }
      
      seller = await Shop.create({
          name, email, avatar, password, zipCode, address, phoneNumber
      });

      console.log("create seller", seller)

      sendShopToken(seller, 201, res);

  } catch (error) {
      return next(new ErrorHandler(error.message, 500));
  }
}))

//login shop
router.post("/login-shop", catchAsyncErrors(async(req, res, next) => {
  try {
      const {email, password} = req.body;
      if (!email || !password) {
          return next(new ErrorHandler("Please provide the all fields!", 400))
      }

      const seller = await Shop.findOne({email}).select("+password");

      if (!seller) {
          return next(new ErrorHandler("Seller doesn't exists!", 400));
      }
      console.log()
      const isPasswordValid = await seller.comparePassword(password);

      if (!isPasswordValid) {
          return next(new ErrorHandler("Please provide the correct information", 400));
      }

      console.log("seller.comparePassword(password)", isPasswordValid)

      sendShopToken(seller, 201, res)
  } catch (error) {
      return next(new ErrorHandler(error.message, 500));
  }
}));

//load shop
router.get("/getseller", isSellerToken, catchAsyncErrors(async (req, res, next) => {
    try {
        const seller = await Shop.findById(req.seller.id);

        if (!seller) {
            return next(new ErrorHandler("Seller doesn't exists", 400))
        }

        res.status(200).json({
            success: true,
            seller,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}))

//
router.get("/getseller-id/:id", catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("req.params.id", req.params.id)
      const otherSeller = await Shop.findById(req.params.id);
      console.log("otherSeller", otherSeller)

      /*if (!seller) {
          return next(new ErrorHandler("Seller doesn't exists", 400))
      }*/

      res.status(200).json({
          success: true,
          otherSeller,
      })

  } catch (error) {
      return next(new ErrorHandler(error.message, 500));
  }
}))

//log out from shop
router.get("/logout", isSellerToken, catchAsyncErrors(async(req, res, next) => {
  try {
      res.cookie("seller_token", null, {
          expires: new Date(Date.now()),
          httpOnly: true,
      });
      res.status(201).json({
          success: true,
          message: "Log out successful!"
      });
  } catch (error) {
      return next(new ErrorHandler(error.message, 500))
  }
}))


module.exports = router
