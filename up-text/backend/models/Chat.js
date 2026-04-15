import mongoose from "mongoose"

const chatSchema = new mongoose.Schema(
  {
    name: String,

    isGroup: {
      type: Boolean,
      default: false,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

export default mongoose.model("Chat", chatSchema)