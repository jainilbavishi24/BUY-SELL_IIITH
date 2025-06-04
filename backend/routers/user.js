import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import { hashOTP, generateOTP } from "../utils/otp.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userRouter = express.Router();


const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized access. Token required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};


userRouter.get("/:id/cart", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;


    if (req.user?.userId !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to cart.",
      });
    }

    const user = await User.findById(id).populate("cart");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Error fetching cart.", error: error.message });
  }
});


userRouter.get("/:id/items", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await Item.find({ createdBy: id });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching items.", error });
  }
});


userRouter.post("/:id/cart", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { itemId } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.cart.push(item._id);
    await user.save();

    res.json({ success: true, message: "Item added to cart.", cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding to cart.", error });
  }
});


userRouter.delete("/cart", authenticateUser, async (req, res) => {
  const userId = req.user.userId;  // Extract userId from token
  const { itemId } = req.body;  // Get itemId from request body

  if (!itemId) {
    return res.status(400).json({ success: false, message: "Item ID is required." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Remove item from cart
    user.cart = user.cart.filter((cartItemId) => cartItemId.toString() !== itemId);
    await user.save();

    res.json({ success: true, message: "Item removed from cart.", cart: user.cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Error removing from cart." });
  }
});


userRouter.post("/:id/review", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { userId, reviewText, rating } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const review = {
      userId,
      text: reviewText,
      rating,
    };

    user.sellerReviews.push(review);
    await user.save();

    res.json({ success: true, message: "Review added successfully.", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding review.", error });
  }
});

userRouter.get("/:id/profile", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("fname lname age contactNo");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile.", error });
  }
});


userRouter.put("/:id/profile", authenticateUser, async (req, res) => {
  const { fname, lname, age, contactNo, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

  
    if (fname) user.fname = fname;
    if (lname) user.lname = lname;
    if (age) user.age = age;
    if (contactNo) user.contactNo = contactNo;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating profile.", error });
  }
});


userRouter.get("/:userId/orders",authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get orders." });
  }
});

userRouter.post("/:userId/order",authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in the cart." });
    }

    const itemDetails = await Item.find({ _id: { $in: items } });

    if (!itemDetails.length) {
      return res.status(400).json({ success: false, message: "Invalid items in the cart." });
    }

    const totalAmount = itemDetails.reduce((acc, item) => acc + item.price, 0);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();  
    const hashedOTP = await bcrypt.hash(otp, 10);

    const order = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      items: itemDetails.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        description: item.description,
        category: item.category,
        sellerID: item.sellerID,  
        image: item.image
      })),
      amount: totalAmount,
      hashedOTP,
      sellerID: itemDetails[0].sellerID,
      transactionID: crypto.randomUUID(),
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      otp: otp, 
    });

  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ success: false, message: "Order placement failed.", error: error.message });
  }
});

userRouter.post("/:orderId/verify",authenticateUser, async (req, res) => {
  const { otp } = req.body;
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isMatch = await bcrypt.compare(otp, order.hashedOTP);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    order.status = "Delivered";
    await order.save();
    res.json({ success: true, message: "Order delivered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

userRouter.post("/checkout", authenticateUser, async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({ success: false, message: "Invalid order data." });
    }

    const otpDetails = await Promise.all(
      items.map(async (item) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        return {
          itemId: item._id,
          sellerID: item.sellerID,
          otpHash: hashedOtp,
          plainotp: otp,
          otpExpiration: new Date().getTime() + 10 * 60 * 1000, 
        };
      })
    );

    console.log("Order created for:", userId, "with items:", items);

    await Order.create({
      userId,
      items: otpDetails.map((item) => ({
        itemId: item.itemId,
        sellerID: item.sellerID,
        otpHash: item.otpHash,
        otpExpiration: item.otpExpiration,
      })),
      amount: items.reduce((acc, item) => acc + item.price, 0),
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { $in: items.map((item) => item._id) } },
    });

    await Item.updateMany(
      { _id: { $in: items.map((item) => item._id) } },
      { $set: { isActive: false } }
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      otpDetails: otpDetails.map((item) => ({
        itemId: item.itemId,
        otp: item.plainotp, 
      })),
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ success: false, message: "Order placement failed." });
  }
});


userRouter.get("/history", authenticateUser,async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    // Fetch orders from the database, including items with OTP hashes
    const orders = await Order.find({ userId }).populate("items.itemId");

    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found." });
    }

    // Retrieve the stored OTPs from local storage (in frontend) and prepare response
    const responseOrders = orders.map(order => ({
      _id: order._id,
      amount: order.amount,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        itemId: item.itemId._id.toString(),
        name: item.itemId.name, // Assuming 'name' exists in Item schema
        price: item.itemId.price, // Assuming 'price' exists in Item schema
        sellerID: item.sellerID,
        status: item.status,
        otpHash: item.otpHash, // Send hashed OTP from DB
      })),
    }));

    res.status(200).json({ success: true, orders: responseOrders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order history." });
  }
});

userRouter.post("/complete", authenticateUser,async (req, res) => {
  const { itemId, otp } = req.body;

  try {
    // Find the order containing the specific item
    const order = await Order.findOne({ "items.itemId": itemId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Find the specific item in the order
    const itemIndex = order.items.findIndex((item) => item.itemId.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in the order." });
    }

    const item = order.items[itemIndex];

    // Compare the entered OTP with the stored hash using bcrypt
    console.log("Entered OTP:", otp);
    console.log("Stored OTP hash:", item.otpHash);

    const isOtpValid = await bcrypt.compare(otp, item.otpHash);

    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP, please try again." });
    }

    // Mark the item as completed
    order.items[itemIndex].status = "Completed";


    // Check if all items in the order are completed
    const allItemsCompleted = order.items.every((item) => item.status === "Completed");

    await order.save();

    await Item.findByIdAndUpdate(item._id, {isActive: false});


    // Respond with success
    res.status(200).json({
      success: true,
      message: "Order item completed successfully!",
      allItemsCompleted,
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ success: false, message: "Failed to complete the order. Please try again." });
  }
});


userRouter.get('/:userId/seller-reviews', authenticateUser,async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('sellerReviews.userId', 'fname lname')
      .populate('sellerReviews.itemId', 'name');
      
    const reviews = user.sellerReviews.map(review => ({
      rating: review.rating,
      text: review.text,
      itemName: review.itemId.name,
      reviewer: `${review.userId.fname} ${review.userId.lname}`
    }));

    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching seller reviews' });
  }
});




userRouter.post("/add", authenticateUser, async (req, res) => {
  try {
    const { userId, itemId, text, rating, sellerID } = req.body;

    console.log("Review Request Data:", req.body); 

  
    if (!userId || !itemId || !text || !rating || !sellerID) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        receivedData: { userId, itemId, text, rating, sellerID },
      });
    }

   
    const seller = await User.findById(sellerID);
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    
    const existingReview = seller.sellerReviews.find(
      (review) => review.userId.toString() === userId && review.itemId.toString() === itemId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this item.",
      });
    }

    
    const newReview = {
      userId,
      itemId,
      text,
      rating,
    };

    
    seller.sellerReviews.push(newReview);
    await seller.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});


userRouter.get("/orders", authenticateUser,async (req, res) => {
  try {
    const { sellerID } = req.query;

    if (!sellerID) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const orders = await Order.find({
      "items.sellerID": sellerID,
      "items.status": "Pending",
    }).populate("items.itemId userId");

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending orders found for this seller",
      });
    }

    console.log(`Seller Orders for ID ${sellerID}:`, orders.length);
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error retrieving seller orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve seller orders.",
      error: error.message,
    });
  }
});


userRouter.get("/orders-with-buyer",authenticateUser,async (req, res) => {
  const { sellerID } = req.query;

  try {
    const orders = await Order.find({
      "items.sellerID": sellerID,
      "items.status": "Pending"
    })
    .populate({
      path: 'userId', 
      select: 'fname lname email contactNo'
    })
    .populate({
      path: 'items.itemId',
      select: 'name price'
    });

    res.status(200).json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders" 
    });
  }
});





userRouter.post("/check-reviewed", authenticateUser, async (req, res) => {
  try {
    const { userId, itemIds } = req.body;

    if (!userId || !Array.isArray(itemIds)) {
      return res.status(400).json({ success: false, error: "Invalid request data" });
    }

 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const reviewedItems = new Set();

    user.sellerReviews.forEach((review) => {
      if (itemIds.includes(review.itemId.toString())) {
        reviewedItems.add(review.itemId.toString());
      }
    });

    res.json({ success: true, reviewedItems: [...reviewedItems] });
  } catch (error) {
    console.error("Error checking reviews:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


userRouter.get("/pastorders", async (req, res) => {
  const { sellerID } = req.query;

  try {
    const orders = await Order.find({
      "items.sellerID": sellerID,
    })
    .populate({
      path: 'userId', 
      select: 'fname lname email contactNo'
    })
    .populate({
      path: 'items.itemId',
      select: 'name price'
    });

    res.status(200).json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders" 
    });
  }
});




userRouter.post("/regenerate-otp", authenticateUser, async (req, res) => {
  const { orderId, itemId } = req.body;

  try {
    
    const order = await Order.findOne({ "items.itemId": itemId, _id: orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const item = order.items.find((i) => i.itemId.toString() === itemId);

   
    if (item.status === "Completed") {
      return res.status(400).json({ error: "This item is already completed." });
    }

    
    const currentTime = new Date();
    if (currentTime < item.otpExpiration) {
      return res.status(400).json({ error: "OTP is still valid." });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const otpHash = await bcrypt.hash(otp, 10);

    
    item.otpHash = otpHash;
    item.otpExpiration = new Date(currentTime.getTime() + 1 * 60000); 
    await order.save();

    res.status(200).json({
      success: true,
      otp, 
    });
  } catch (error) {
    console.error("Error regenerating OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


userRouter.get("/:sellerID", async (req, res) => {
  const { sellerID } = req.params;

  try {
   
    const vendor = await User.findById(sellerID, 'fname lname email contactNo');

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    return res.json({
      success: true,
      data: {
        fname: vendor.fname,
        lname: vendor.lname,
        email: vendor.email,
        contactNo: vendor.contactNo,
      }
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});



export default userRouter;
