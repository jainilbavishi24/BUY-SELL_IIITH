import mongoose from "mongoose";
import Item from "./item.model.js";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});


reviewSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        default: ""
    },
    lname: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        default: 0
    },
    contactNo: {
        type: String,
        default: "0000000000"
    },
    password: {
        type: String,
        required: false
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'

    }],
    sellerReviews: [reviewSchema],
    
});

const User = mongoose.model("User", userSchema);
export default User;