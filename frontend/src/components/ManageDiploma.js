import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ManageDiploma = () => {
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

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!diploma) return <p>⏳ Φόρτωση...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h3>🔧 Διαχείριση Διπλωματικής</h3>
      <p><strong>Τίτλος:</strong> {diploma.titlos}</p>
      <p><strong>Κατάσταση:</strong> {diploma.katastasi}</p>

      {diploma.katastasi === "υπό ανάθεση" && (
        <button onClick={() => navigate(`/view-proskliseis/${diploma._id}`)}>
          🧾 Προβολή Προσκλήσεων
        </button>
      )}
    </div>
  );
};


export default ManageDiploma;
