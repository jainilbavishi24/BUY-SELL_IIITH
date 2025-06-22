import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function cleanupUsers() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Find users with problematic sellerReviews (null values)
    const problematicUsers = await collection.find({
      "sellerReviews.userId": null,
      "sellerReviews.itemId": null
    }).toArray();

    console.log(`Found ${problematicUsers.length} users with problematic sellerReviews`);

    if (problematicUsers.length > 0) {
      // Update these users to have empty sellerReviews arrays
      const result = await collection.updateMany(
        {
          "sellerReviews.userId": null,
          "sellerReviews.itemId": null
        },
        {
          $set: { sellerReviews: [] }
        }
      );

      console.log(`Updated ${result.modifiedCount} users`);
    }

    // Also clean up any users with empty sellerReviews arrays that might have null values
    const result2 = await collection.updateMany(
      {
        sellerReviews: { $exists: true, $ne: [] },
        $or: [
          { "sellerReviews.userId": null },
          { "sellerReviews.itemId": null }
        ]
      },
      {
        $set: { sellerReviews: [] }
      }
    );

    console.log(`Updated ${result2.modifiedCount} additional users`);

    console.log("Cleanup completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning up users:", error);
    process.exit(1);
  }
}

cleanupUsers(); 