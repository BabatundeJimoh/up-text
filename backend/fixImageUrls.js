import dotenv from "dotenv"
import mongoose from "mongoose"
import User from "./models/User.js"

dotenv.config()

const OLD_URL = "http://localhost:5001"
const NEW_URL = process.env.BASE_URL // ✅ FIX

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log("Connected to DB...")

    const users = await User.find({
      profilePic: { $regex: OLD_URL }
    })

    for (const user of users) {
      user.profilePic = user.profilePic.replace(OLD_URL, NEW_URL)
      await user.save()
      console.log(`Fixed user: ${user._id}`)
    }

    console.log("✅ Done fixing images")
    process.exit()
  } catch (err) {
    console.error("Error:", err.message)
    process.exit(1)
  }
}

fixImages()