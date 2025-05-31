import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignThema = () => {
  const [themata, setThemata] = useState([]);
  const [selectedThemaId, setSelectedThemaId] = useState("");
  const [search, setSearch] = useState({ arithmosMitroou: "", onoma: "", epitheto: "" });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchThemata = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/teacher/themata", {
          headers: { Authorization: token }
        });
        const available = res.data.filter(t => t.katastasi === "διαθέσιμη προς ανάθεση");
        setThemata(available);
      } catch (err) {
        setMessage("⚠️ Σφάλμα φόρτωσης θεμάτων.");
      }
    };
    fetchThemata();
  }, [token]);

  const handleAssign = async () => {
    try {
      if (!selectedThemaId) {
        setMessage("⚠️ Επιλέξτε θέμα πρώτα.");
        return;
      }

      const res = await axios.put("http://localhost:4000/api/teacher/anathesi", {
        themaId: selectedThemaId,
        ...search
      }, {
        headers: { Authorization: token }
      });

      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Σφάλμα κατά την ανάθεση.";
      setMessage(msg);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📌 Ανάθεση Θέματος σε Φοιτητή</h2>

      <label>Επιλογή Θέματος:</label>
      <select value={selectedThemaId} onChange={e => setSelectedThemaId(e.target.value)}>
        <option value="">-- Επιλέξτε --</option>
        {themata.map(t => (
          <option key={t._id} value={t._id}>{t.titlos}</option>
        ))}
      </select>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Αριθμός Μητρώου"
          value={search.arithmosMitroou}
          onChange={(e) => setSearch({ ...search, arithmosMitroou: e.target.value })}
        />
        <input
          placeholder="Όνομα"
          value={search.onoma}
          onChange={(e) => setSearch({ ...search, onoma: e.target.value })}
        />
        <input
          placeholder="Επώνυμο"
          value={search.epitheto}
          onChange={(e) => setSearch({ ...search, epitheto: e.target.value })}
        />
      </div>

      <button onClick={handleAssign} style={{ marginTop: 10 }}>📤 Ανάθεση</button>

      {message && <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default AssignThema;