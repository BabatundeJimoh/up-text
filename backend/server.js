import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import authRoutes from "./routes/auth.js"
import messageRoutes from "./routes/messages.js"
import chatRoutes from "./routes/chat.js"
import Message from "./models/Message.js"
import Chat from "./models/Chat.js"
import User from "./models/User.js"
import path from "path"
import userRoutes from "./routes/user.js"

dotenv.config()
connectDB()

const app = express()

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
})

/**
 * ================= FIXED CLIENT URL =================
 * ONLY CHANGE: proper frontend URL for production
 */
const CLIENT_URL =
  process.env.CLIENT_URL || "https://up-text-frontend.onrender.com"

// ================= CORS (EXPRESS) =================
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}))

app.use(express.json())
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/user", userRoutes)

// ================= HTTP SERVER =================
const server = http.createServer(app)

/**
 * ================= SOCKET.IO =================
 * FIXED: correct frontend origin for socket connection
 */
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
})

const onlineUsers = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // ================= ONLINE =================
  socket.on("user_online", async (userId) => {
    if (!userId) return

    try {
      onlineUsers.set(userId, socket.id)

      await User.findByIdAndUpdate(userId, {
        lastSeen: null,
      })

      io.emit("online_users", Array.from(onlineUsers.keys()))
    } catch (err) {
      console.error(err.message)
    }
  })

  // ================= JOIN CHAT =================
  socket.on("join_chat", (chatId) => {
    if (!chatId) return
    socket.join(chatId)
  })

  // ================= MARK SEEN =================
  socket.on("mark_seen", async ({ chatId, userId }) => {
    try {
      await Message.updateMany(
        {
          chatId,
          sender: { $ne: userId },
          seen: false,
        },
        { seen: true }
      )

      const chat = await Chat.findById(chatId)

      if (chat) {
        if (!chat.unreadCounts) {
          chat.unreadCounts = new Map()
        }

        chat.unreadCounts.set(userId, 0)
        await chat.save()
      }

      io.to(chatId).emit("messages_seen", {
        chatId,
        userId,
      })
    } catch (err) {
      console.error(err.message)
    }
  })

  // ================= SEND MESSAGE =================
  socket.on("send_message", async (data) => {
    try {
      const { chatId, sender, text } = data
      if (!chatId || !sender || !text) return

      const newMessage = await Message.create({
        chatId,
        sender,
        text,
      })

      const chat = await Chat.findById(chatId)
      if (!chat) return

      chat.lastMessage = text
      chat.updatedAt = new Date()

      if (!chat.unreadCounts) {
        chat.unreadCounts = new Map()
      }

      const senderId = sender.toString()

      chat.members.forEach((memberId) => {
        const id = memberId.toString()

        if (id !== senderId) {
          const current = chat.unreadCounts.get(id) || 0
          chat.unreadCounts.set(id, current + 1)
        }
      })

      await chat.save()

      const populated = await newMessage.populate("sender", "name profilePic")

      io.to(chatId).emit("receive_message", populated)

      chat.members.forEach((memberId) => {
        io.emit(`chat_update_${memberId.toString()}`, {
          chatId,
          lastMessage: text,
        })
      })

    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err.message)
    }
  })

  // ================= DISCONNECT =================
  socket.on("disconnect", async () => {
    try {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId)

          await User.findByIdAndUpdate(userId, {
            lastSeen: new Date(),
          })
          break
        }
      }

      io.emit("online_users", Array.from(onlineUsers.keys()))
    } catch (err) {
      console.error(err.message)
    }
  })
})

// ================= SERVER START =================
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})