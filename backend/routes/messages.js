import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

const router = express.Router();

/**
 * GET messages for a chat
 */
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

/**
 * POST message (THIS WAS MISSING)
 */
router.post("/", async (req, res) => {
  try {
    const { chatId, sender, text } = req.body;

    if (!chatId || !sender || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const message = await Message.create({
      chatId,
      sender,
      text,
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      updatedAt: new Date(),
    });

    const populated = await message.populate("sender", "name");

    res.json({
      success: true,
      message: populated,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
});

export default router;