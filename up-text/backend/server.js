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
import path from "path"

dotenv.config()
connectDB()

const app = express()

// =======================
// MIDDLEWARE
// =======================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
)

app.use(express.json())

// =======================
// STATIC FILES
// =======================
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

// =======================
// ROUTES
// =======================
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/chats", chatRoutes)

app.get("/", (req, res) => res.send("API is running 🚀"))

// =======================
// SERVER + SOCKET
// =======================
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

// =======================
// ONLINE USERS STORE
// =======================
const onlineUsers = new Map()

// =======================
// SOCKET.IO
// =======================
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id)

  // =======================
  // 🟢 USER ONLINE
  // =======================
  socket.on("user_online", (userId) => {
    if (!userId) return

    onlineUsers.set(userId, socket.id)

    io.emit("online_users", Array.from(onlineUsers.keys()))
  })

  // =======================
  // JOIN CHAT ROOM
  // =======================
  socket.on("join_chat", (chatId) => {
    if (!chatId) return
    socket.join(chatId)
  })

  // =======================
  // ✍️ TYPING INDICATOR
  // =======================
  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing", { chatId, userId })
  })

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("stop_typing", { chatId, userId })
  })

  // =======================
  // SEND MESSAGE
  // =======================
  socket.on("send_message", async (data) => {
    try {
      const { chatId, sender, text } = data

      if (!chatId || !sender || !text) return

      // SAVE MESSAGE
      const newMessage = await Message.create({
        chatId,
        sender,
        text,
      })

      // 🔥 UPDATE LAST MESSAGE IN CHAT
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: text,
      })

      // POPULATE SENDER
      const populatedMessage = await newMessage.populate(
        "sender",
        "name profilePic"
      )

      // EMIT MESSAGE
      io.to(chatId).emit("receive_message", populatedMessage)

    } catch (err) {
      console.error("🔥 Socket Error:", err.message)
    }
  })

  // =======================
  // DISCONNECT
  // =======================
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)
        break
      }
    }

    io.emit("online_users", Array.from(onlineUsers.keys()))

    console.log("❌ User disconnected:", socket.id)
  })
})

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})