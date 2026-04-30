import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { upload } from "../config/uploads.js";

const router = express.Router();

router.put("/upload-profile/:id", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" })
    }

    const imageUrl = `https://up-text-backend.onrender.com/uploads/${req.file.filename}`

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic: imageUrl },
      {
        returnDocument: "after", // ✅ FIXED
        runValidators: true,     // ✅ BEST PRACTICE
      }
    )

    // ✅ CONSISTENT RESPONSE (IMPORTANT)
    res.status(200).json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
      }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// ====================== REGISTER ======================
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        profilePic: savedUser.profilePic || "",
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ====================== LOGIN ======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || "",
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ====================== GET USERS ======================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id name email profilePic");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});



// ====================== CREATE GROUP ======================
router.post("/group", async (req, res) => {
  try {
    const { name, members } = req.body

    if (!name || !members || members.length < 2) {
      return res.status(400).json({ message: "Invalid group data" })
    }

    const group = await Chat.create({
      name,
      members,
      isGroup: true,
    })

    const populatedGroup = await group.populate(
      "members",
      "name email profilePic"
    )

    res.status(201).json(populatedGroup)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})



export default router;