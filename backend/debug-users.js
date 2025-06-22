import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function debugUsers() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Check all indexes
    console.log("\n=== INDEXES ===");
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Check all users
    console.log("\n=== ALL USERS ===");
    const users = await collection.find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  _id: ${user._id}`);
      console.log(`  email: ${user.email}`);
      console.log(`  sellerReviews:`, user.sellerReviews);
      console.log(`  sellerReviews length: ${user.sellerReviews ? user.sellerReviews.length : 'undefined'}`);
      console.log('---');
    });

    // Check for users with specific problematic patterns
    console.log("\n=== PROBLEMATIC PATTERNS ===");
    
    const nullUsers = await collection.find({
      "sellerReviews.userId": null
    }).toArray();
    console.log(`Users with null userId in sellerReviews: ${nullUsers.length}`);

    const emptyArrayUsers = await collection.find({
      sellerReviews: []
    }).toArray();
    console.log(`Users with empty sellerReviews array: ${emptyArrayUsers.length}`);

    const noSellerReviewsUsers = await collection.find({
      sellerReviews: { $exists: false }
    }).toArray();
    console.log(`Users without sellerReviews field: ${noSellerReviewsUsers.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error debugging users:", error);
    process.exit(1);
  }
}

debugUsers(); 