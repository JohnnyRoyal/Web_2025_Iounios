// src/components/ThemataView.js
import React, { useEffect, useState } from "react";
import axios from "axios";


const ThemataView = () => {
  const [themata, setThemata] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ titlos: "", perigrafi: "", file: null });
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchThemata = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/teacher/themata", {
          headers: { Authorization: token }
        });
        setThemata(res.data);
      } catch {
        setMsg("Σφάλμα φόρτωσης θεμάτων.");
      }
    };
    fetchThemata();
  }, [token]);

  const startEdit = (thema) => {
    setEditingId(thema._id);
    setEditForm({
      titlos: thema.titlos,
      perigrafi: thema.perigrafi,
      file: null
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ titlos: "", perigrafi: "", file: null });
    setMsg("");
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("titlos", editForm.titlos);
      formData.append("perigrafi", editForm.perigrafi);
      if (editForm.file) formData.append("pdfPerigrafis", editForm.file);

      await axios.put(`http://localhost:4000/api/teacher/themata/${id}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data"
        }
      });

      setMsg("✅ Το θέμα ενημερώθηκε!");
      setEditingId(null);
      window.location.reload(); // ή κάνε refetch με setThemata(...)
    } catch (err) {
      setMsg("❌ Σφάλμα κατά την αποθήκευση.");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>📚 Τα Θέματά μου</h2>

      {themata.map((thema) => (
        <div key={thema._id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
          {editingId === thema._id ? (
            <>
              <input
                value={editForm.titlos}
                onChange={(e) => setEditForm({ ...editForm, titlos: e.target.value })}
                placeholder="Τίτλος"
                style={{ width: "100%", marginBottom: 8 }}
              />
              <textarea
                value={editForm.perigrafi}
                onChange={(e) => setEditForm({ ...editForm, perigrafi: e.target.value })}
                placeholder="Περιγραφή"
                rows={4}
                style={{ width: "100%", marginBottom: 8 }}
              />
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })}
              />
              <br />
              <button onClick={() => handleUpdate(thema._id)}>💾 Αποθήκευση</button>
              <button onClick={cancelEdit} style={{ marginLeft: 8 }}>❌ Άκυρο</button>
            </>
          ) : (
            <>
              <p><strong>Τίτλος:</strong> {thema.titlos}</p>
              <p><strong>Περιγραφή:</strong> {thema.perigrafi}</p>
              {thema.pdfPerigrafi && (
                <a href={`http://localhost:4000/${thema.pdfPath}`} target="_blank" rel="noreferrer">📎 PDF</a>
              )}
              <br />
              <button onClick={() => startEdit(thema)}>✏️ Επεξεργασία</button>
              {thema.isAssigned && (
                <p style={{ color: "green", marginTop: 6 }}>
                  ✅ Ανατεθειμένο σε: {thema.assignedTo?.name} ({thema.assignedTo?.am})
                </p>
              )}
            </>
          )}
        </div>
      ))}

      {msg && <p style={{ color: msg.includes("✅") ? "green" : "red" }}>{msg}</p>}
    </div>
  );
};

export default ThemataView;






/*import React, { useEffect, useState } from "react";
import axios from "axios";

const ThemataView = () => {
  const [themata, setThemata] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchThemata = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/teacher/themata", {
          headers: { Authorization: token }
        });
        setThemata(res.data);
      } catch (err) {
        setError("Σφάλμα φόρτωσης θεμάτων");
      }
    };

    fetchThemata();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>📚 Τα Θέματά Μου</h2>
      {themata.length === 0 ? (
        <p>Δεν υπάρχουν ακόμη καταχωρημένα θέματα.</p>
      ) : (
        <ul>
          {themata.map((thema) => (
            <li key={thema._id} style={{ marginBottom: 15 }}>
              <strong>Τίτλος:</strong> {thema.titlos} <br />
              <strong>Περιγραφή:</strong> {thema.perigrafi} <br />
              <strong>Κατάσταση:</strong>{" "}
              {thema.isAssigned
                ? `Ανατεθειμένο στον/στην ${thema.assignedTo.name} (ΑΜ: ${thema.assignedTo.am})`
                : "Διαθέσιμο"}{" "}
              <br />
              {thema.pdfPerigrafi && (
                <a
                  href={`http://localhost:4000/${thema.pdfPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Προβολή PDF
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemataView;
*/