// src/components/DiplomaManager.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const DiplomaManager = () => {
  const [status, setStatus] = useState("");
  const [invites, setInvites] = useState([]);
  const [form, setForm] = useState({ didaskonId: "", onoma: "", epitheto: "" });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchDiploma = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/diplomas/my", {
        headers: { Authorization: token }
      });
      setStatus(res.data.status);
    } catch (err) {
      setMessage("Σφάλμα φόρτωσης διπλωματικής");
    }
  };

  const fetchInvites = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/diplomas/my-invites", {
        headers: { Authorization: token }
      });
      setInvites(res.data.invites);
    } catch (err) {
      setMessage("Σφάλμα φόρτωσης προσκλήσεων");
    }
  };

  useEffect(() => {
    fetchDiploma();
    fetchInvites();
  }, []);

  const handleInvite = async () => {
    setMessage("");
    try {
      await axios.post("http://localhost:4000/api/diplomas/invite", form, {
        headers: { Authorization: token }
      });
      setForm({ didaskonId: "", onoma: "", epitheto: "" });
      fetchInvites();
      setMessage("Η πρόσκληση στάλθηκε επιτυχώς.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Σφάλμα αποστολής πρόσκλησης");
    }
  };

  if (status !== "υπό ανάθεση") return <p>Η διαχείριση είναι διαθέσιμη μόνο στη φάση "υπό ανάθεση".</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2>📨 Διαχείριση Προσκλήσεων Επιτροπής</h2>

      <div style={{ marginBottom: 20 }}>
        <label>ID Διδάσκοντα:</label>
        <input value={form.didaskonId} onChange={(e) => setForm({ ...form, didaskonId: e.target.value })} />
        <br />
        <label>Όνομα:</label>
        <input value={form.onoma} onChange={(e) => setForm({ ...form, onoma: e.target.value })} />
        <br />
        <label>Επίθετο:</label>
        <input value={form.epitheto} onChange={(e) => setForm({ ...form, epitheto: e.target.value })} />
        <br />
        <button onClick={handleInvite}>➕ Αποστολή Πρόσκλησης</button>
      </div>

      <h3>📋 Απεσταλμένες Προσκλήσεις</h3>
      <ul>
        {invites.map((inv, idx) => (
          <li key={idx}>
            {inv.onoma} {inv.epitheto} ({inv.didaskonId}) - 
            {inv.apodoxi === null ? "Εκκρεμεί" : inv.apodoxi ? "Αποδεκτή" : "Απορρίφθηκε"}
          </li>
        ))}
      </ul>

      {message && <p style={{ color: message.includes("Σφάλμα") ? "red" : "green" }}>{message}</p>}
    </div>
  );
};

export default DiplomaManager;
