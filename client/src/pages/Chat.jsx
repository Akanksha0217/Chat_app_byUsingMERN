import { useEffect, useState, useContext } from "react";
import axios from "../utils/axios";
import { socket } from "../socket/socket";
import EmojiPicker from "emoji-picker-react";
import { AuthContext } from "../context/AuthContext";

export default function Chat() {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (user?.user?._id) {
      socket.emit("setup", user.user._id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("message received", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop typing", () => setTyping(false));

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    // fetch all users for sidebar
    const fetchUsers = async () => {
      const { data } = await axios.get("/auth/users");
      setUsers(data);
    };
    fetchUsers();
  }, []);

  if (!user) return null;

  const sendMessage = async () => {
    if (!message || !selectedUser) return;

    const { data } = await axios.post(
      "/message",
      { content: message, receiverId: selectedUser._id },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    socket.emit("new message", data);
    setMessages((prev) => [...prev, data]);
    setMessage("");
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">

      {/* LEFT SIDEBAR */}
      <div className="w-1/3 bg-white dark:bg-gray-800 border-r flex flex-col">

        {/* Profile Section */}
        <div className="p-4 flex items-center space-x-3 border-b">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
            {user.user.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {user.user.name}
            </h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                selectedUser?._id === u._id ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  {u.name[0]}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-800 dark:text-white">
                  {u.name}
                </p>
                <p className="text-xs text-gray-500">Click to chat</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {/* Chat Header */}
        {selectedUser ? (
          <>
            <div className="p-4 border-b bg-white dark:bg-gray-800 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {selectedUser.name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                    m.sender === user.user._id
                      ? "ml-auto bg-green-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {typing && (
                <p className="text-sm text-gray-400">Typing...</p>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-800 flex items-center">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="text-xl mr-2"
              >
                😊
              </button>

              <input
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  socket.emit("typing", selectedUser._id);
                }}
                onBlur={() => socket.emit("stop typing", selectedUser._id)}
                className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Type a message..."
              />

              <button
                onClick={sendMessage}
                className="ml-3 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a user to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
}