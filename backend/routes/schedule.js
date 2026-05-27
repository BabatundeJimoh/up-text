import express from "express"
import agenda from "../config/agenda.js"

const router = express.Router()

router.post("/message", async (req, res) => {
  try {
    const { chatId, sender, text, sendAt } = req.body

    if (!chatId || !sender || !text || !sendAt) {
      return res.status(400).json({ message: "Missing fields" })
    }

    await agenda.schedule(new Date(sendAt), "send scheduled message", {
      chatId,
      sender,
      text,
    })

    res.json({ message: "Message scheduled successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router