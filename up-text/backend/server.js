import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import chatRoutes from "./routes/chat.js";

import Message from "./models/Message.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => res.send("API is running 🚀"));

// Create server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join chat
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  // Send message (ONLY PLACE WE SAVE)
  socket.on("send_message", async (data) => {
    try {
      const { chatId, sender, text } = data;

      if (!chatId || !sender || !text) return;

      const newMessage = await Message.create({
        chatId,
        sender,
        text,
      });

      const populatedMessage = await newMessage.populate(
        "sender",
        "name"
      );

      io.to(chatId).emit("receive_message", populatedMessage);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);