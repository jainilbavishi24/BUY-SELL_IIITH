import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function fixIndex() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Drop the existing problematic index
    console.log("Dropping existing index...");
    await collection.dropIndex("sellerReviews.userId_1_sellerReviews.itemId_1");
    console.log("Index dropped successfully");

    // Create the new sparse index
    console.log("Creating new sparse index...");
    await collection.createIndex(
      { "sellerReviews.userId": 1, "sellerReviews.itemId": 1 },
      { unique: true, sparse: true }
    );
    console.log("New sparse index created successfully");

    console.log("Index fix completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing index:", error);
    process.exit(1);
  }
}

fixIndex(); 