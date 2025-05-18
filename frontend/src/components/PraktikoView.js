// src/components/PraktikoView.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PraktikoView = () => {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHTML = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/diplomas/generate-praktiko", {
          headers: { Authorization: token }
        });
        setHtml(res.data);
      } catch {
        setError("Σφάλμα κατά τη φόρτωση του πρακτικού.");
      }
    };
    fetchHTML();
  }, [token]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!html) return <p>Φόρτωση πρακτικού...</p>;

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>⬅ Επιστροφή</button>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ border: "1px solid #ccc", padding: 20, background: "#f9f9f9" }}
      />
    </div>
  );
};

export default PraktikoView;