const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    fileUrl: String,
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
