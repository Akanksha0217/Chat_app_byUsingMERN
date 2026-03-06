import { useEffect, useState, useContext, useRef } from "react";
import axios from "../utils/axios";
import { socket } from "../socket/socket";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Chat() {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const profileInputRef = useRef(null);
  const chatFileRef = useRef(null);

  // SOCKET SETUP
  useEffect(() => {
    if (user?.user?._id) {
      socket.emit("setup", user.user._id);
    }
  }, [user]);

  // RECEIVE MESSAGE
  useEffect(() => {
    socket.on("message received", (msg) => {
      if (currentChat && msg.chat._id === currentChat._id) {
        setMessages((prev) => [...prev, msg]);

        socket.emit("message delivered", {
          messageId: msg._id,
          chatId: msg.chat._id,
        });
      }
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop typing", () => setTyping(false));

    socket.on("user status changed", ({ userId, isOnline }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline } : u)),
      );
    });

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("user status changed");
    };
  }, [currentChat]);

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
  const sendMessage = async (fileUrl = null) => {
    if (!message && !fileUrl) return;

    socket.emit("stop typing", currentChat._id);

    const { data } = await axios.post(
      "/message",
      {
        content: message,
        chatId: currentChat._id,
        fileUrl,
      },
      {
        headers: { Authorization: `Bearer ${user.token}` },
      },
    );

    socket.emit("new message", data);

    setMessages((prev) => [...prev, data]);
    setMessage("");
  };

  // TYPING
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!currentChat) return;

    socket.emit("typing", currentChat._id);

    setTimeout(() => {
      socket.emit("stop typing", currentChat._id);
    }, 1500);
  };

  // PROFILE IMAGE CLICK
  const handleImageClick = () => {
    profileInputRef.current.click();
  };

  // PROFILE IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.info("Uploading image...");

      const { data } = await axios.post("/upload", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await axios.put(
        "/auth/update-profile",
        { profilePic: data.url },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      user.user.profilePic = data.url;

      toast.success("Profile updated");
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
      {/* SIDEBAR */}
      <div className="w-1/3 bg-white shadow-xl border-r flex flex-col">
        {/* PROFILE */}
        <div className="p-4 flex items-center gap-3 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div onClick={handleImageClick} className="cursor-pointer">
            <img
              src={user.user.profilePic || "/default.png"}
              className="w-12 h-12 rounded-full border-2 border-white"
              alt=""
            />
          </div>

          <input
            type="file"
            ref={profileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          <div>
            <h3 className="font-semibold">{user.user.name}</h3>
            <p className="text-xs">
              {user.user.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* USERS */}
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => openChat(u)}
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition"
            >
              <div className="relative">
                <img
                  src={u.profilePic || "/default.png"}
                  className="w-11 h-11 rounded-full"
                  alt=""
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
                      ? `Last seen ${new Date(u.lastSeen).toLocaleTimeString()}`
                      : "Offline"}
                </p>
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
            <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm">
              <img
                src={selectedUser.profilePic || "/default.png"}
                className="w-10 h-10 rounded-full"
                alt=""
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
                  {m.fileUrl ? (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      📄 Download File
                    </a>
                  ) : (
                    <span>{m.content}</span>
                  )}

                  {/* MESSAGE STATUS */}
                  {m.sender._id === user.user._id && (
                    <div className="text-xs mt-1 text-right">
                      {m.status === "sent" && "✔"}
                      {m.status === "delivered" && "✔✔"}
                      {m.status === "seen" && (
                        <span className="text-blue-300">✔✔</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef}></div>
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white border-t flex items-center gap-2">
              <input
                value={message}
                onChange={handleTyping}
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Type a message..."
              />

              <input
                type="file"
                ref={chatFileRef}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];

                  const formData = new FormData();
                  formData.append("file", file);

                  const { data } = await axios.post("/upload", formData, {
                    headers: {
                      Authorization: `Bearer ${user.token}`,
                      "Content-Type": "multipart/form-data",
                    },
                  });

                  sendMessage(data.url);
                }}
              />

              <button
                onClick={() => chatFileRef.current.click()}
                className="px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                📎
              </button>

              <button
                onClick={() => sendMessage()}
                className="px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 shadow"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a chat to start messaging 💬
          </div>
        )}
      </div>
    </div>
  );
}
