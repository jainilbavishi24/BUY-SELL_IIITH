import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  sellerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cartedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available",
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  reservedAt: {
    type: Date,
    default: null,
  },
});

const Item = mongoose.model("Item", itemSchema);
export default Item;
