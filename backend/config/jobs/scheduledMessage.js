import Message from "../../models/Message.js"
import Chat from "../../models/Chat.js"
import User from "../../models/User.js"

export const defineScheduledMessage = (agenda, io) => {
  agenda.define("send scheduled message", async (job) => {
    const { chatId, sender, text } = job.attrs.data

    // 1. save message
    const newMessage = await Message.create({
      chatId,
      sender,
      text,
      createdAt: new Date(),
    })

    // 2. update chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      updatedAt: new Date(),
    })

    // 3. populate sender (important for UI)
    const populated = await newMessage.populate("sender", "name profilePic")

    console.log("📩 Sending scheduled message:", text)

    // 4. 🚀 SEND TO USERS VIA SOCKET
    io.to(chatId).emit("receive_message", populated)
  })
}