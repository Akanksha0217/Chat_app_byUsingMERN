import { useEffect, useState, useContext, useRef } from "react";
import axios from "../utils/axios";
import { socket } from "../socket/socket";
import { AuthContext } from "../context/AuthContext";

export default function Chat() {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // SOCKET SETUP
  useEffect(() => {
    if (user?.user?._id) {
      socket.emit("setup", user.user._id);
    }
  }, [user]);

  // RECEIVE MESSAGE
  useEffect(() => {
    socket.on("message received", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user status changed", ({ userId, isOnline }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline } : u)),
      );
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop typing", () => setTyping(false));

    return () => {
      socket.off("message received");
      socket.off("user status changed");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios.get("/auth/users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(data);
    };
    if (user?.token) fetchUsers();
  }, [user]);

  if (!user) return null;

  // OPEN CHAT
  const openChat = async (u) => {
    setSelectedUser(u);

    const { data } = await axios.post(
      "/chat",
      { userId: u._id },
      { headers: { Authorization: `Bearer ${user.token}` } },
    );

    setCurrentChat(data);

    const messagesRes = await axios.get(`/message/${data._id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setMessages(messagesRes.data);
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message || !currentChat) return;

    socket.emit("stop typing", currentChat._id);

    const { data } = await axios.post(
      "/message",
      {
        content: message,
        chatId: currentChat._id,
      },
      { headers: { Authorization: `Bearer ${user.token}` } },
    );

    socket.emit("new message", data);
    setMessages((prev) => [...prev, data]);
    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!currentChat) return;

    socket.emit("typing", currentChat._id);

    setTimeout(() => {
      socket.emit("stop typing", currentChat._id);
    }, 1500);
  };

  // profile update
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      await axios.put(
        "/auth/update-profile",
        { profilePic: data.url },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      alert("Profile picture updated!");
      window.location.reload();
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-1/3 bg-white border-r flex flex-col shadow-lg">
        {/* PROFILE */}
        <div className="p-4 flex items-center space-x-3 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div onClick={handleImageClick} className="cursor-pointer">
            <img
              src={user.user.profilePic || "/default.png"}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
          <div>
            <h3 className="font-semibold">{user.user.name}</h3>
            <p className="text-xs">
              {user.user.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* USERS LIST */}
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => openChat(u)}
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition ${
                selectedUser?._id === u._id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={u.profilePic || "/default.png"}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      u.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                </div>

                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-400">
                    {u.isOnline
                      ? "Online"
                      : u.lastSeen
                        ? `Last seen ${new Date(
                            u.lastSeen,
                          ).toLocaleTimeString()}`
                        : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b bg-white flex items-center space-x-3 shadow-sm">
              <img
                src={selectedUser.profilePic || "/default.png"}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{selectedUser.name}</h3>
                <p className="text-xs text-gray-400">
                  {typing ? "Typing..." : ""}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm ${
                    m.sender._id === user.user._id
                      ? "ml-auto bg-green-500 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white flex items-center border-t">
              <input
                value={message}
                onChange={handleTyping}
                className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="ml-3 px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-md"
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
