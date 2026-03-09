const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const message = await Message.create({
    sender: req.user.id,
    content: req.body.content,
    chat: req.body.chatId,
    fileUrl: req.body.fileUrl,
    status: "sent",
  });

  const fullMessage = await Message.findById(message._id)
    .populate("sender", "name profilePic")
    .populate("chat");

  res.json(fullMessage);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId }).populate(
    "sender",
    "name profilePic",
  );

  res.json(messages);
};

//ticke
exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId, status } = req.body;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true },
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Status update failed" });
  }
};
