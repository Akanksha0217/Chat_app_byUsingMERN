import { useState, useContext } from "react";
import axios from "../utils/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      navigate("/chat");
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

      <div className="bg-white/20 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/30">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h2>

        <div className="space-y-5">

          <div>
            <label className="text-white text-sm">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="text-white text-sm">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <button
            onClick={submit}
            className="w-full py-3 rounded-xl bg-white text-purple-600 font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-lg"
          >
            Login
          </button>

          <p className="text-center text-white text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="underline font-semibold">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}