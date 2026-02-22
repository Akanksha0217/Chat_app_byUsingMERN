const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const message = await Message.create({
    sender: req.user.id,
    content: req.body.content,
    chat: req.body.chatId,
    fileUrl: req.body.fileUrl,
  });

  res.json(message);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name profilePic");

  res.json(messages);
};