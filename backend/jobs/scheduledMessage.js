import Message from "../models/Message.js"
import Chat from "../models/Chat.js"

export const defineScheduledMessage = (agenda) => {
  agenda.define("send scheduled message", async (job) => {
    const { chatId, sender, text } = job.attrs.data

    const newMessage = await Message.create({
      chatId,
      sender,
      text,
    })

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      updatedAt: new Date(),
    })

    console.log("📩 Scheduled message sent:", text)
  })
}