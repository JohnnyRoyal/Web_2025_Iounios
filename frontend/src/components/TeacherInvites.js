import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherInvites.css"; //Το στυλ για τις προσκλήσεις διδασκόντων

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
    <div>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>📩 Προσκλήσεις για Τριμελείς Επιτροπές</h2>

      {invites.length === 0 ? (
        <p className="message">Δεν έχετε ενεργές προσκλήσεις.</p>
      ) : (
        invites.map((invite, index) => (
          <div key={index} className="invite-box">
            <div className="invite-detail">
              <p><strong>Τίτλος:</strong> {invite.titlos}</p>
            </div>
            <div className="invite-detail">
              <p><strong>Περιγραφή:</strong> {invite.perigrafi}</p>
            </div>
            <div className="invite-detail">
              <p><strong>Φοιτητής:</strong> {invite.foititis}</p>
            </div>
            <button onClick={() => respondToInvite(index, "apodoxi")}>✅ Αποδοχή</button>
            <button onClick={() => respondToInvite(index, "aporripsi")}>❌ Απόρριψη</button>
          </div>
        ))
      )}

      {msg && <p className="message" style={{ color: msg.includes("❌") ? "red" : "green" }}>{msg}</p>}
      <button onClick={() => navigate("/teacher")} className="return-button">🔙 Επιστροφή</button>
    </div>
  );
};

export default TeacherInvites;
