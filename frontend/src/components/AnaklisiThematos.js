/*import React, { useEffect, useState } from "react";
import axios from "axios";

const AnaklisiThematos = () => {
  const [themata, setThemata] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/teacher/themata", {
          headers: { Authorization: token }
        });
        const ypoAnathesi = res.data.filter(t => t.katastasi === "υπό ανάθεση");
        setThemata(ypoAnathesi);
      } catch {
        setMessage("⚠️ Σφάλμα φόρτωσης θεμάτων.");
      }
    };
    fetchAssigned();
  }, [token]);

  const handleAnaklisi = async (id) => {
    try {
      const res = await axios.put("http://localhost:4000/api/teacher/anaklisi", { themaId: id }, {
        headers: { Authorization: token }
      });
      setMessage("✅ " + res.data.message);
      setThemata(themata.filter(t => t._id !== id)); // Αφαιρούμε από τη λίστα
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Σφάλμα ανάκλησης.";
      setMessage(msg);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧾 Ανάκληση Αναθέσεων</h2>
      {themata.length === 0 && <p>Δεν υπάρχουν θέματα υπό ανάθεση.</p>}

      {themata.map(t => (
        <div key={t._id} style={{ border: "1px solid #aaa", padding: 10, marginBottom: 12 }}>
          <p><strong>Τίτλος:</strong> {t.titlos}</p>
          <p><strong>Φοιτητής:</strong> {t.foititis?.onoma} {t.foititis?.epitheto} ({t.foititis?.arithmosMitroou})</p>
          <button onClick={() => handleAnaklisi(t._id)}>⛔ Ανάκληση</button>
        </div>
      ))}

      {message && <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default AnaklisiThematos;
*/