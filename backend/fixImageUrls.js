import dotenv from "dotenv"
import mongoose from "mongoose"
import User from "./models/User.js"

dotenv.config()

const OLD_URL = "http://localhost:5000"
const NEW_URL = "https://up-text-backend.onrender.com"

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log("Connected to DB...")

    // ================= USERS PROFILE PICTURES =================
    const users = await User.find({ profilePic: { $regex: OLD_URL } })

    for (const user of users) {
      user.profilePic = user.profilePic.replace(OLD_URL, NEW_URL)
      await user.save()
      console.log(`Fixed user: ${user._id}`)
    }

    console.log("✅ All image URLs fixed successfully!")
    process.exit()
  } catch (err) {
    console.error("❌ Error fixing images:", err.message)
    process.exit(1)
  }
}

fixImages()