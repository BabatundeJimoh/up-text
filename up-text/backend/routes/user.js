import express from "express"
import User from "../models/User.js"
import multer from "multer"
import path from "path"

const router = express.Router()

// ===== MULTER SETUP =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// ===== UPDATE PROFILE PIC =====
router.put("/profile-pic/:id", upload.single("image"), async (req, res) => {
  try {
    const userId = req.params.id

    const imagePath = req.file ? `/uploads/${req.file.filename}` : ""

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: imagePath },
      { new: true }
    )

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Upload failed" })
  }
})

export default router