import express from "express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all conversations for the logged-in user
router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await Conversation.find({ participants: userId }).populate("participants", "fname lname email");
    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
});

// Get all messages for a conversation
router.get("/messages/:conversationId", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).populate("sender", "fname lname email");
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

// Create a new conversation (if not exists)
router.post("/conversations", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ success: false, message: "participantId is required" });
    }
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 }
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId]
      });
    }
    await conversation.populate("participants", "fname lname email");
    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create conversation" });
  }
});

export default router; 