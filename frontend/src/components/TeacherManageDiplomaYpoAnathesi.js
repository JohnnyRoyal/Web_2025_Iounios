import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ThemataView.css"; // Χρησιμοποιούμε το ίδιο CSS

const TeacherManageDiplomaYpoAnathesi = () => {
  const { id } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:4000/api/teacher/diplomatikes/${id}`, {
      headers: { Authorization: token }
    }).then(res => {
      setDiploma(res.data);
    }).catch(() => setError("❌ Σφάλμα φόρτωσης"));
  }, [id, token]);

  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!diploma) return <p className="msg">⏳ Φόρτωση...</p>;

  return (
    <div className="container" style={{ marginTop: 40 }}>
      <h2 className="heading">🔧 Διαχείριση Διπλωματικής</h2>
      <div className="list">
        <div className="list-item">
          <p><strong>Τίτλος:</strong> {diploma.titlos}</p>
          <p><strong>Κατάσταση:</strong> {diploma.katastasi}</p>

          {diploma.katastasi === "υπό ανάθεση" && (
            <div style={{ marginTop: 18 }}>
              <button
                className="button"
                onClick={() => navigate(`/view-proskliseis/${diploma._id}`)}
              >
                📄 Προβολή Προσκλήσεων
              </button>

              <button
                className="button-cancel"
                onClick={async () => {
                  try {
                    const confirm = window.confirm("Θέλετε σίγουρα να ακυρώσετε την ανάθεση;");
                    if (!confirm) return;

                    await axios.put("http://localhost:4000/api/teacher/anaklisi", {
                      themaId: diploma._id
                    }, {
                      headers: { Authorization: localStorage.getItem("token") }
                    });

                    alert("✅ Η ανάθεση ακυρώθηκε με επιτυχία.");
                    navigate("/ProfessorDiplomas");
                  } catch (err) {
                    console.error(err);
                    alert("❌ Σφάλμα κατά την ακύρωση της ανάθεσης.");
                  }
                }}
              >
                ❌ Ακύρωση Ανάθεσης Θέματος
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherManageDiplomaYpoAnathesi;
