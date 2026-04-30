import express from "express"
import Chat from "../models/Chat.js"
import User from "../models/User.js"

const router = express.Router()

// ================= GET CHATS =================
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId

    const chats = await Chat.find({ members: userId })
      .populate("members", "name profilePic email lastSeen")
      .sort({ updatedAt: -1 })

    const formattedChats = chats.map(chat => {
      const unread = chat.unreadCounts?.get(userId.toString()) || 0

      return {
        ...chat._doc,
        id: chat._id,
        unreadCount: unread,
      }
    })

    res.json(formattedChats)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to fetch chats" })
  }
})


// ================= CREATE 1:1 CHAT =================
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body

    console.log("Incoming chat request:", senderId, receiverId)

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing senderId or receiverId" })
    }

    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [senderId, receiverId], $size: 2 },
    })

    if (chat) {
      return res.status(200).json(chat)
    }

    chat = await Chat.create({
      name: "Direct Chat",
      isGroup: false,
      members: [senderId, receiverId],
      unreadCounts: new Map(), // 🔥 IMPORTANT INIT
    })

    res.status(201).json(chat)
  } catch (err) {
    console.error("CREATE CHAT ERROR:", err)
    res.status(500).json({ message: "Failed to create chat" })
  }
})


// ================= CREATE GROUP =================
router.post("/group", async (req, res) => {
  try {
    const { name, members } = req.body

    if (!name || !members || members.length < 2) {
      return res.status(400).json({ message: "Invalid group data" })
    }

    const groupChat = await Chat.create({
      name,
      isGroup: true,
      members,
      unreadCounts: new Map(), // 🔥 IMPORTANT
    })

    res.status(201).json(groupChat)
  } catch (err) {
    console.error("GROUP ERROR:", err)
    res.status(500).json({ message: "Failed to create group chat" })
  }
})


// ================= UPDATE USER (optional fix) =================
router.put("/update/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router