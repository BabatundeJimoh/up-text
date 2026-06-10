import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Chat from "../models/Chat.js"
import upload from "../config/multerCloud.js"


const router = express.Router();

router.put("/upload-profile/:id", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("MULTER ERROR:", err)
      return res.status(500).json({
        message: err.message,
        error: err,
      })
    }

    next()
  })
}, async (req, res) => {
  try {
    console.log("========== UPLOAD ==========")
    console.log("FILE:", req.file)

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic: req.file.path },
      { returnDocument: "after" }
    )

    res.json({ user: updatedUser })
  } catch (err) {
    console.error("UPLOAD ERROR:", err)
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

///delete chat (soft delete)
router.put("/chat/delete/:id", async (req, res) => {
  await Chat.findByIdAndUpdate(req.params.id, {
    deleted: true,
    deletedAt: new Date()
  })

  res.json({ success: true })
})


//permanent delete chat
router.delete("/chat/permanent/:id", async (req, res) => {
  await Chat.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})



export default router;