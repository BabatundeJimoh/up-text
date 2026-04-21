import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ✅ ADD THIS (for avatars)
    profilePic: {
      type: String,
      default: "",
    },

    // ✅ ADD THIS (for last seen)
    lastSeen: {
      type: Date,
      default: null, // null = user is online
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);