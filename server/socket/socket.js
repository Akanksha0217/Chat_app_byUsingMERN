const User = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("setup", async (userId) => {
      socket.join(userId);
      await User.findByIdAndUpdate(userId, { isOnline: true });
    });

    socket.on("join chat", (room) => socket.join(room));

    socket.on("typing", (room) => socket.to(room).emit("typing"));

    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("new message", (msg) => {
      socket.to(msg.chat).emit("message received", msg);
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
    });
  });
};