import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      sellerID: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      otpHash: {
        type: String,
        required: true,
      },
      otpExpiration: {
        type: Date, 
        required: true,
      },
      status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
      },
    },
  ],
  amount: {
    type: Number,
    required: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
