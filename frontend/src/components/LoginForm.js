// src/components/LoginForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [diplomas, setDiplomas] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState("json");
  const [loading, setLoading] = useState(false);

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
      } else if (role === "teacher") {
        navigate("/teacher");
      } else {
        setError("Μη έγκυρος ρόλος χρήστη");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Σφάλμα σύνδεσης");
    }
  };

  
  // Φόρτωση διπλωματικών με φίλτρα
  const fetchDiplomas = async () => {
    setLoading(true);
    try {
      // Μετατροπή ημερομηνιών σε ευρωπαϊκή μορφή (DD/MM/YYYY)
      const formatDateToEuropean = (date) => {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
      };

      let url = `http://localhost:4000/api/diplomas/nologin`;
      if (from) url += `?from=${from}`;
      if (to) url += `&to=${to}`;

      const res = await axios.get(url);
      setDiplomas(res.data || []);
    } catch (e) {
      setDiplomas([]);
      console.error("Diplomas fetch error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiplomas();
    // eslint-disable-next-line
  }, [from, to, format]);

  return (

    <div className="login-container">
  <h2>🔐 Σύνδεση</h2>
  <form onSubmit={handleSubmit}>
    <label>Username:</label>
    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

    <label>Password:</label>
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

    <button type="submit">Σύνδεση</button>
  </form>

  {error && <p style={{ color: "red" }}>{error}</p>}

  <div className="public-section">
    <h3>📢 Ανακοινώσεις Διπλωματικών (Δημόσια Πρόσβαση)</h3>

    <label>Από:</label>
    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />

    <label>Έως:</label>
    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />

    <label>Μορφή:</label>
    <select value={format} onChange={(e) => setFormat(e.target.value)}>
      <option value="json">JSON</option>
      <option value="xml">XML</option>
    </select>

    <button onClick={fetchDiplomas}>Ανανέωση</button>

    
    {loading ? (
      <p>Φόρτωση...</p>
    ) : (
      format === "xml" ? (
        <pre style={{ maxHeight: 300, overflow: "auto", background: "#f8f8f8", padding: 10 }}>
          {diplomas || "Δεν βρέθηκαν διπλωματικές."}
        </pre>
      ) : (
        <ul>
          {diplomas.length === 0 && <li>Δεν βρέθηκαν διπλωματικές.</li>}
          {diplomas.map((d, idx) => (
            <li key={idx}>
              <strong>{d.titlos}</strong>
              <br />
              {d.perigrafi}
              <br />
              {d.pdf_extra_perigrafi && (
                <a href={d.pdf_extra_perigrafi} target="_blank" rel="noopener noreferrer">
                  Προβολή PDF
                </a>
              )}
              <br />              
              <b>Ημ/νία ανακοίνωσης εξέτασης:</b>{" "}
              {new Date(d.imerominia_anakinosis_diplomatikis).toLocaleDateString("el-GR")}
              <br />
              <b>Τρόπος εξέτασης:</b> {d.tropos_exetasis}
              <br />
              {d.tropos_exetasis === "δια ζώσης" && d.aithousaExetasis && (
                <>
                  <b>Τοποθεσία:</b> {d.aithousaExetasis}
                  <br />
                </>
              )}
              {d.tropos_exetasis === "εξ αποστάσεως" && d.syndesmosExetasis && (
                <>
                  <b>Σύνδεσμος:</b>{" "}
                  <a href={d.syndesmosExetasis} target="_blank" rel="noopener noreferrer">
                    {d.syndesmosExetasis}
                  </a>
                  <br />
                </>
              )}             
            </li>
          ))}
        </ul>
      )
    )}
  </div>
</div>
);
};

export default LoginForm;
