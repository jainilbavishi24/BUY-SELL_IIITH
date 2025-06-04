import express from 'express';
import dotenv from 'dotenv';
// import { connect } from 'mongoose';
import { connectDB } from './config/db.js';

dotenv.config();    
const app=express();

app.get("/products", (req, res) => {});

console.log("ENV MONGO_URI =",process.env.MONGO_URI);

app.listen(5000, () => {
    // Connect to the database
    connectDB();
    console.log("Server started at http://localhost:5000");
});

