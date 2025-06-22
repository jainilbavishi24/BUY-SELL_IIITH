import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "userId is required"], // Ensure userId is always set
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: [true, "itemId is required"], // Ensure itemId is always set
  },
  text: {
    type: String,
    required: [true, "Review text is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
  },
});

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  contactNo: String,
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  sellerReviews: {
    type: [reviewSchema],
    default: [],
  },
  isNewUser: { type: Boolean, default: true },
  isProfileComplete: { type: Boolean, default: false },
});

userSchema.index({ "sellerReviews.userId": 1, "sellerReviews.itemId": 1 }, { unique: true, sparse: true });

const User = mongoose.model("User", userSchema);
export default User;