import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams , useNavigate } from "react-router-dom"; // Χρησιμοποιείται για να πάρουμε το id της διπλωματικής από το URL και για να πλοηγηθούμε στην προηγούμενη σελίδα μετά την αλλαγή κατάστασης ή την ακύρωση ανάθεσης
import "./TeacherDiplomas.css";

const TeacherManageDiplomaEnergi = () => {
  const { id } = useParams(); // παίρνει το id από το URL
  const [active, setActive] = useState(""); // sxolio | akyrwsh | allagi
  const [comment, setComment] = useState("");
  const [date, setDate] = useState("");
  const [assemblyNumber, setAssemblyNumber] = useState("");
  const [message, setMessage] = useState("");
  const [diploma, setDiploma] = useState(null);
  const [error, setError] = useState("");
  const [myComments, setMyComments] = useState([]); //Για να φορτώνει αυτόματα τα σχόλια του καθηγητή 
  const navigate = useNavigate();// Χρησιμοποιείται για πλοήγηση στην προηγούμενη σελίδα για μετά την αλλαγή κατάστασης και την ακύρωση ανάθεσης

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`http://localhost:4000/api/teacher/diplomatikes/${id}`, {
      headers: { Authorization: token }
    }).then(res => { /*σημαφόρος σαν το await περιμένει να ολοκληρωθεί η async μέσα στο get*/
      setDiploma(res.data);
    }).catch(() => setError("❌ Σφάλμα φόρτωσης"));
  }, [id, token]);

  // Κάθε φορά που ανοίγει η φόρμα σχολίου, φέρε τα σχόλια
  useEffect(() => {
    if (active === "sxolio") {
      fetchMyComments();
    }
    // eslint-disable-next-line
  }, [active, id, token]);

  const formatDateEU = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Φόρτωση σχολίων του καθηγητή για αυτή τη διπλωματική , πάντα πριν πατίσει ο καθηγητής να καταχωρήσει νέο σχόλιο χρειάζομαι νέο route :( μπλιαχ
  const fetchMyComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/teacher/diaxirisi/energi/sxolia/${id}`,
        { headers: { Authorization: token } }
      );
      setMyComments(res.data.myComments || []);
    } catch {
      setMyComments([]);
    }
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
      setComment("");
      setMyComments(res.data.myComments || []); // ανανέωση λίστας σχολίων
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

  if (error) return <p className="error">{error}</p>;
  if (!diploma) return <p className="msg">⏳ Φόρτωση...</p>;

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 40 }}>
      <h2 className="heading">🔧 Διαχείριση Διπλωματικής</h2>
      <div className="list">
        <div className="list-item">
          <p><strong>Τίτλος:</strong> {diploma.titlos}</p>
          <p><strong>Κατάσταση:</strong> {diploma.katastasi}</p>
        </div>
      </div>

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
          {/* Λίστα σχολίων του καθηγητή */}
          <div style={{ marginTop: 18 }}>
            <b>Τα σχόλιά σας για αυτή τη διπλωματική:</b>
            <ul style={{ marginTop: 8, background: "#f8f8f8", padding: 10, borderRadius: 6 }}>
              {myComments.length === 0 && <li>Δεν έχετε καταχωρήσει σχόλια.</li>}
              {myComments.map((sx, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  <span className="comment-text">{sx.keimeno}</span>
                  <br />
                  <span style={{ fontSize: "0.9em", color: "#888" }}>
                    {new Date(sx.createdAt).toLocaleString("el-GR")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
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