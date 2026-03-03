import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
  const { user } = useContext(AuthContext);

  return (
  
      <Routes>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to={user ? "/chat" : "/login"} />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/login" />}
        />

      </Routes>
 
  );
}

export default App;