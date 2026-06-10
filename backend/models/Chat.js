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

    unreadCounts: {
  type: Map,
  of: Number,
  default: {}
},

deleted: {
  type: Boolean,
  default: false
},
deletedAt: {
  type: Date,
  default: null
}

  },
  { timestamps: true }
)

export default mongoose.model("Chat", chatSchema)