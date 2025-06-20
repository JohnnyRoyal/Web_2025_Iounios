// src/components/DiplomaManager.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ExetasiPhase from "./ExetasiPhase";
import FinishedPhase from "./FinishedPhase";
import "./DiplomaManager.css"; // Προσθήκη CSS για στυλ

// Το DiplomaManager είναι το κύριο συστατικό για τη διαχείριση της διπλωματικής εργασίας του φοιτητή. Και ανάλογα με την κατάσταση της διπλωματικής, εμφανίζει διαφορετικά υποσυστήματα:

// 1. **Υπό Ανάθεση**: Επιτρέπει στον φοιτητή να στείλει προσκλήσεις σε διδάσκοντες για την επιτροπή.
// 2. **Υπό Εξέταση**: Εμφανίζει τη σελίδα ExetasiPhase για τη διαχείριση της εξέτασης της διπλωματικής.
// 3. **Περατωμένη**: Εμφανίζει τη σελίδα FinishedPhase με τις τελικές πληροφορίες της διπλωματικής.

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

  if (!status) return <p>Φόρτωση...</p>;


  if (status.trim() === "υπό ανάθεση") {
    return (
      <div className="container">
        <h2>📨 Διαχείριση Προσκλήσεων Επιτροπής</h2>

        <div className="detail-box" style={{ marginBottom: 20 }}>
          <label>ID Διδάσκοντα:</label>
          <input
            value={form.didaskonId}
            onChange={(e) => setForm({ ...form, didaskonId: e.target.value })}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <label>Όνομα:</label>
          <input
            value={form.onoma}
            onChange={(e) => setForm({ ...form, onoma: e.target.value })}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <label>Επίθετο:</label>
          <input
            value={form.epitheto}
            onChange={(e) => setForm({ ...form, epitheto: e.target.value })}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button className="button" onClick={handleInvite}>➕ Αποστολή Πρόσκλησης</button>
        </div>

        <h3>📋 Απεσταλμένες Προσκλήσεις</h3>
        <ul>
          {invites.map((inv, idx) => (
            <li key={idx} className="detail-box" style={{ marginBottom: 10 }}>
              {inv.onoma} {inv.epitheto} ({inv.didaskonId}) -{" "}
              {inv.apodoxi === null
                ? "Εκκρεμεί"
                : inv.apodoxi
                ? "Αποδεκτή"
                : "Απορρίφθηκε"}
            </li>
          ))}
        </ul>

        {message && (
          <p style={{ color: message.includes("Σφάλμα") ? "red" : "green" }}>{message}</p>
        )}
      </div>
    );
  }

  if (status.trim() === "υπό εξέταση") {
    return <ExetasiPhase />;
       
  }

  if (status.trim() === "περατωμένη") {
    return <FinishedPhase />;
  }

  return <p>Καθώς η διπλωματική βρίσκεται στην κατάσταση "{status}", δεν είναι δυνατή η διαχείριση της απο τον φοιτητή σε αυτό το στάδιο.</p>;
};

export default DiplomaManager;
