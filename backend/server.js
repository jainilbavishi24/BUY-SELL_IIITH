import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import router from "./routers/route.js";
import authRouter from "./routers/auth.js";
import userRouter from "./routers/user.js";
import cors from "cors";
import crypto from "crypto";
import User from "./models/user.model.js";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from '@google/generative-ai';

import xml2js from 'xml2js';
import https from 'https';
import chatRouter from "./routers/chat.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import Message from "./models/message.model.js";
import Conversation from "./models/conversation.model.js";

dotenv.config();

console.log("JWT_SECRET at startup:", process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use("/api/order", userRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/items", router);
app.use("/api/orders", router);
app.use("/api/users", router);
app.use("/api/seller",userRouter);
app.use("/api/reviews",userRouter);
app.use("/api/chat", chatRouter);

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

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/chatbot', async (req, res) => {
  const { message, history } = req.body;

  try {
    // Platform context to include with every message
    const platformContext = `Context: You are a helpful assistant for Buy-Sell IIITH, a marketplace platform for IIIT Hyderabad students. Key features: IIIT email authentication, marketplace browsing, shopping cart, profile management, SMS password reset, dark/light mode. Main pages: Home (marketplace), Create (add items), My Cart, Profile, My Items, Order History. Always provide helpful, IIIT community-focused answers.`;

    // Build conversation history properly - only include actual user/bot exchanges
    const conversationHistory = [];

    // Process history - skip the initial welcome message from frontend
    const userBotHistory = history.filter((msg, index) => {
      // Skip the first message if it's the welcome message from bot
      if (index === 0 && !msg.isUser && msg.text.includes("Buy-Sell IIITH assistant")) {
        return false;
      }
      return true;
    });

    // Add filtered history to conversation
    userBotHistory.forEach(msg => {
      conversationHistory.push({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    // Start chat with the conversation history
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Send the current message with context
    const messageWithContext = `${platformContext}\n\nUser: ${message}`;
    const result = await chat.sendMessage(messageWithContext);
    const response = result.response.text();

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
    return res.redirect(`${FRONTEND_URL}/login?error=Invalid_ticket`);
  }

  try {
    const serviceURL = encodeURIComponent(`${BACKEND_URL}/api/auth/cas/callback`);
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
      return res.redirect(`${FRONTEND_URL}/login?error=Authentication_failed`);
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
      const nameParts = email.split('@')[0].split('.');
      user = new User({
        email,
        password: crypto.randomBytes(16).toString('hex'),
        fname: nameParts[0] || 'User',
        lname: nameParts[1] || '',
        contactNo: '0000000000',
        isNewUser: true,
        isProfileComplete: false, // CAS users need to complete their profile
        sellerReviews: [], // Ensure sellerReviews is initialized properly
      });

      // Validate required fields before saving
      if (!user.fname || !user.lname || !user.email) {
        throw new Error('Invalid user data from CAS response');
      }

      await user.save();
    } else {
      // Update last login for existing users
      user.lastLogin = new Date();
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.redirect(`${FRONTEND_URL}/auth/cas/callback?token=${token}&userId=${user._id}`);

  } catch (error) {
    console.error('CAS Login Error:', error);
    console.error('Error details:', error.stack);
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
  }
};

app.get('/api/auth/cas/callback', casLoginCallback);

const handleLogout = async (_req, res) => {
  try {
    const serviceURL = encodeURIComponent(`${FRONTEND_URL}/login`);
    const casLogoutUrl = `https://login.iiit.ac.in/cas/logout?service=${serviceURL}`;

    res.json({ casLogoutUrl });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

app.post('/api/auth/logout', handleLogout);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Example Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("chat:message", async (msg) => {
    try {
      // Save message to DB
      const newMessage = new Message({
        conversationId: msg.conversationId,
        sender: msg.sender,
        text: msg.text,
      });
      await newMessage.save();

      // Update conversation's lastMessage and updatedAt
      await Conversation.findByIdAndUpdate(msg.conversationId, {
        lastMessage: newMessage._id,
        updatedAt: new Date()
      });

      // Populate sender for frontend display
      const populatedMsg = await Message.findById(newMessage._id).populate("sender", "_id fname email");

      // Emit to all clients (or to room if you want privacy)
      io.emit("chat:message", {
        ...populatedMsg.toObject(),
        conversationId: msg.conversationId
      });
    } catch (err) {
      console.error("Error handling chat:message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
