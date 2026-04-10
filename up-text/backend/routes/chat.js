import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();

// ✅ Get all chats for a user
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.params.userId] },
    }).populate("members", "name email");

    res.status(200).json(chats);
  } catch (err) {
    console.error("GET CHATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// ✅ Create or get 1:1 chat
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // 🔥 DEBUG LOG (IMPORTANT)
    console.log("Incoming chat request:", senderId, receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing senderId or receiverId" });
    }

    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [senderId, receiverId], $size: 2 },
    });

    if (chat) {
      console.log("Chat already exists");
      return res.status(200).json(chat);
    }

    chat = await Chat.create({
      name: "Direct Chat",
      isGroup: false,
      members: [senderId, receiverId],
    });

    console.log("New chat created:", chat);

    res.status(201).json(chat);
  } catch (err) {
    console.error("CREATE CHAT ERROR:", err);
    res.status(500).json({ message: "Failed to create chat" });
  }
});

// ✅ Create group chat
router.post("/group", async (req, res) => {
  try {
    const { name, members } = req.body;

    console.log("Creating group:", name, members);

    if (!name || !members || members.length < 2) {
      return res.status(400).json({ message: "Invalid group data" });
    }

    const groupChat = await Chat.create({
      name,
      isGroup: true,
      members,
    });

    res.status(201).json(groupChat);
  } catch (err) {
    console.error("GROUP ERROR:", err);
    res.status(500).json({ message: "Failed to create group chat" });
  }
});

export default router;