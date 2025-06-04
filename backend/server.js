import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import router from "./routers/route.js";
import authRouter from "./routers/auth.js";
import userRouter from "./routers/user.js";
import Order from "./models/order.model.js";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "./models/user.model.js";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from '@google/generative-ai';

import xml2js from 'xml2js';
import https from 'https';
import Item from "./models/item.model.js";





dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());
app.use("/api/order", userRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/items", router);
app.use("/api/orders", router);
app.use("/api/users", router);
app.use("/api/seller",userRouter);
app.use("/api/reviews",userRouter);


app.post('/api/auth/cas-validate', async (req, res) => {
  const { ticket, service } = req.body;
  console.log("Received ticket:", ticket);
  console.log("Received service URL:", service);

  if (!ticket || !service) {
    return res.status(401).json({ success: false, message: "Missing ticket or service URL" });
  }

  try {
    const casValidationUrl = `https://login.iiit.ac.in/cas/validate?ticket=${ticket}&service=${service}`;
    console.log("Sending request to CAS:", casValidationUrl);

    const response = await fetch(casValidationUrl);
    const casData = await response.text();
    console.log("CAS response:", casData);

    if (casData.startsWith("yes")) {
      const [, username] = casData.split("\n");
      res.json({ success: true, token: "your-generated-token", user: { username } });
    } else {
      res.status(401).json({ success: false, message: "Invalid CAS ticket" });
    }
  } catch (error) {
    console.error("CAS validation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

app.post('/api/chatbot', async (req, res) => {
  const { message, history } = req.body;

  try {
    const formattedHistory = history
      .filter(msg => msg.isUser)
      .map(msg => ({
        role: 'user',
        parts: [{ text: msg.text }]
      }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate response',
    });
  }
});
const casLoginCallback = async (req, res) => {
  const ticket = req.query.ticket;

  if (!ticket) {
    return res.redirect('http://localhost:5173/login?error=Invalid_ticket');
  }

  try {
    const serviceURL = encodeURIComponent('http://localhost:5000/api/auth/cas/callback');
    const validateURL = `https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=${serviceURL}`;

    const response = await new Promise((resolve, reject) => {
      https.get(validateURL, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    console.log('Raw CAS Response:', response);

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response);

    console.log('Parsed CAS Response:', JSON.stringify(result, null, 2));

    if (!result['cas:serviceResponse']) {
      throw new Error('Invalid CAS response structure');
    }

    const authSuccess = result['cas:serviceResponse']['cas:authenticationSuccess']?.[0];
    if (!authSuccess) {
      return res.redirect('http://localhost:5173/login?error=Authentication_failed');
    }

    const username = authSuccess['cas:user']?.[0];
    if (!username) {
      throw new Error('No username in CAS response');
    }

    const email = username.includes('@') ? username : `${username}@iiit.ac.in`;
    
    const attributes = authSuccess['cas:attributes']?.[0];
    console.log('CAS Attributes:', attributes);

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        password: crypto.randomBytes(16).toString('hex'),
        name: email.split('@')[0],
        phoneNumber: '0000000000',
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.redirect(`http://localhost:5173/auth/cas/callback?token=${token}&userId=${user._id}`);

  } catch (error) {
    console.error('CAS Login Error:', error);
    console.error('Error details:', error.stack);
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
  }
};
app.get('/api/auth/cas/callback', casLoginCallback);


const handleLogout = async (req, res) => {
  try {

    const serviceURL = encodeURIComponent('http://localhost:5173/login');
    const casLogoutUrl = `https://login.iiit.ac.in/cas/logout?service=${serviceURL}`;
    

    res.json({ casLogoutUrl });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

app.post('/api/auth/logout', handleLogout);


app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
