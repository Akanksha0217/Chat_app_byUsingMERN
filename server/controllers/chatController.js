const Chat = require("../models/Chat");

exports.createChat = async (req, res) => {
  const chat = await Chat.create({
    users: [req.user.id, req.body.userId],
    isGroupChat: false,
  });

  res.json(chat);
};

exports.createGroup = async (req, res) => {
  const chat = await Chat.create({
    chatName: req.body.name,
    users: req.body.users,
    isGroupChat: true,
    groupAdmin: req.user.id,
  });

  res.json(chat);
};