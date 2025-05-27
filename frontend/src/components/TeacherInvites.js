import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeacherInvites = () => {
  const [invites, setInvites] = useState([]);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/teacher/proskliseis", {
          headers: { Authorization: token }
        });
        setInvites(res.data);
      } catch {
        setMsg("Σφάλμα κατά την φόρτωση των προσκλήσεων.");
      }
    };
    fetchInvites();
  }, [token]);

  const respondToInvite = async (index, action) => {
    try {
      const url = `http://localhost:4000/api/teacher/proskliseis/${action}/${index}`;
      await axios.put(url, {}, { headers: { Authorization: token } });
      setMsg("Η απάντηση καταχωρήθηκε.");
      setInvites(prev => prev.filter((_, i) => i !== index));
    } catch {
      setMsg("❌ Αποτυχία απάντησης στην πρόσκληση.");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>📩 Προσκλήσεις για Τριμελείς Επιτροπές</h2>

      {invites.length === 0 ? (
        <p>Δεν έχετε ενεργές προσκλήσεις.</p>
      ) : (
        invites.map((invite, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: 16, marginBottom: 12 }}>
            <p><strong>Τίτλος:</strong> {invite.titlos}</p>
            <p><strong>Περιγραφή:</strong> {invite.perigrafi}</p>
            <p><strong>Φοιτητής:</strong> {invite.foititis}</p>
            <button onClick={() => respondToInvite(index, "apodoxi")}>✅ Αποδοχή</button>
            <button onClick={() => respondToInvite(index, "aporripsi")} style={{ marginLeft: 8 }}>❌ Απόρριψη</button>
          </div>
        ))
      )}

      {msg && <p style={{ color: msg.includes("❌") ? "red" : "green" }}>{msg}</p>}
      <button onClick={() => navigate("/teacher")} style={{ marginTop: 20 }}>🔙 Επιστροφή</button>
    </div>
  );
};

export default TeacherInvites;
