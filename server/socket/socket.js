const User = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {

    // USER SETUP
    socket.on("setup", async (userId) => {
      socket.userId = userId;   // ✅ store user id
      socket.join(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: null,
      });

      io.emit("user status changed", {
        userId,
        isOnline: true,
      });
    });

    // TYPING
    socket.on("typing", (room) => {
      socket.to(room).emit("typing");
    });

    socket.on("stop typing", (room) => {
      socket.to(room).emit("stop typing");
    });

    // NEW MESSAGE
    socket.on("new message", (msg) => {
      socket.to(msg.chat).emit("message received", msg);
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user status changed", {
          userId: socket.userId,
          isOnline: false,
        });
      }
    });
  });
};