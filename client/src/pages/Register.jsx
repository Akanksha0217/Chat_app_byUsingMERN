import { useState } from "react";
import axios from "../utils/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await axios.post("/auth/register", form);
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-4">
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-white">
        
        <h2 className="text-3xl font-bold text-center mb-6">
          Create Account
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition"
          />

          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition"
          />

          <button
            onClick={submit}
            className="w-full bg-white text-indigo-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition duration-300 shadow-md"
          >
            Register
          </button>
        </div>

        <p className="text-center text-sm mt-6 text-white/80">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-semibold underline hover:text-gray-200"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}