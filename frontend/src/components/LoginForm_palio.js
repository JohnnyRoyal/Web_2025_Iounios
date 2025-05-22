// src/components/LoginForm.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        username,
        password
      });

      // Αποθήκευση του token στο localStorage
      localStorage.setItem("token", `Bearer ${res.data.token}`);

      // Έλεγχος του ρόλου από το token
      const { role } = JSON.parse(atob(res.data.token.split(".")[1])); // Αποκωδικοποίηση του payload του JWT του token

      if (role === "student") {
        navigate("/student");
      } else if (role === "secretary") {
        navigate("/secretary");
      } else {
        setError("Μη έγκυρος ρόλος χρήστη");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Σφάλμα σύνδεσης");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>🔐 Σύνδεση </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit">Σύνδεση</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
