import React, { useState } from "react";
import axios from "axios";
import { useParams , useNavigate} from "react-router-dom"; // Χρησιμοποιείται για να πάρουμε το id της διπλωματικής από το URL και για να πλοηγηθούμε στην προηγούμενη σελίδα μετά την αλλαγή κατάστασης ή την ακύρωση ανάθεσης

const TeacherManageDiplomaEnergi = () => {
  const { id } = useParams(); // παίρνει το id από το URL
  const [active, setActive] = useState(""); // sxolio | akyrwsh | allagi
  const [comment, setComment] = useState("");
  const [date, setDate] = useState("");
  const [assemblyNumber, setAssemblyNumber] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Χρησιμοποιείται για πλοήγηση στην προηγούμενη σελίδα για μετά την αλλαγή κατάστασης και την ακύρωση ανάθεσης

  const token = localStorage.getItem("token");

  const formatDateEU = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Υποβολή σχολίου
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:4000/api/teacher/diaxirisi/energi/sxolia",
        { id, keimeno: comment },
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Σφάλμα.");
    }
  };

  // Υποβολή ακύρωσης ανάθεσης
  const handleSubmitCancel = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:4000/api/teacher/diaxirisi/energi/akyrwsh",
        {
          id,
          imerominiaGenikisSyneleysis: date,
          arithmosGenikhsSynelefsisAkyrwshs: assemblyNumber
        },
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message);

      // Αναμονή 5 δευτερόλεπτα και μετά επιστροφή στην προηγούμενη σελίδα
      setTimeout(() => {
        navigate(-1);
      }, 5000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Σφάλμα.");
    }
  };

  // Υποβολή αλλαγής κατάστασης σε "Υπό Εξέταση"
  const handleSubmitChangeStatus = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:4000/api/teacher/diaxirisi/energi/allagi",
        { id },
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message);
      
      // Αναμονή 5 δευτερόλεπτα και μετά επιστροφή στην προηγούμενη σελίδα
      setTimeout(() => {
        navigate(-1);
      }, 5000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Σφάλμα.");
    }
  };

  // Επαναφορά πεδίων όταν αλλάζει λειτουργία
  const handleSetActive = (val) => {
    setActive(val);
    setComment("");
    setDate("");
    setAssemblyNumber("");
    setMessage("");
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: "40px auto",
      padding: 24,
      border: "1px solid #ddd",
      borderRadius: 8,
      background: "#f9f9f9"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Ενέργειες Διδάσκοντα</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
        <button className="button" onClick={() => handleSetActive("sxolio")}>➕ Καταχώρηση Σχολίου</button>
        <button className="button" onClick={() => handleSetActive("akyrwsh")}>❌ Ακύρωση Ανάθεσης</button>
        <button className="button" onClick={() => handleSetActive("allagi")}>🔄 Υπό Εξέταση</button>
      </div>

      {/* Φόρμα σχολίου */}
      {active === "sxolio" && (
        <form onSubmit={handleSubmitComment} style={{ marginBottom: 16 }}>
          <label>Σχόλιο (μέχρι 300 χαρακτήρες):</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, 300))}
            required
            rows={4}
            style={{ width: "100%", marginBottom: 12 }}
            maxLength={300}
          />
          <button className="button" type="submit">Υποβολή Σχολίου</button>
          {message && <p style={{ marginTop: 10, color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
        </form>
      )}

      {/* Φόρμα ακύρωσης ανάθεσης */}
      {active === "akyrwsh" && (
        <form onSubmit={handleSubmitCancel} style={{ marginBottom: 16 }}>
          <label>Ημερομηνία Γενικής Συνέλευσης:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12 }}
          />
              {date && (
                <div style={{ marginBottom: 8, color: "#555" }}>
                    Επιλεγμένη ημερομηνία: {formatDateEU(date)}
                </div>
              )}
          <label>Αριθμός Γενικής Συνέλευσης:</label>
          <input
            type="text"
            value={assemblyNumber}
            onChange={e => setAssemblyNumber(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12 }}
          />
          <button className="button" type="submit">Ακύρωση Ανάθεσης</button>
          {message && <p style={{ marginTop: 10, color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
        </form>
      )}

      {/* Φόρμα αλλαγής κατάστασης */}
      {active === "allagi" && (
        <form onSubmit={handleSubmitChangeStatus} style={{ marginBottom: 16 }}>
          <button className="button" type="submit">Αλλαγή σε "Υπό Εξέταση"</button>
          {message && <p style={{ marginTop: 10, color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
        </form>
      )}
    </div>
  );
};

export default TeacherManageDiplomaEnergi;