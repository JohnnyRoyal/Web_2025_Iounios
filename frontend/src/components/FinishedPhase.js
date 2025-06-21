// src/components/FinishedPhase.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DiplomaManager.css";

const FinishedPhase = () => {
  const [diploma, setDiploma] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // ✅ Προσθήκη hook για navigation

  useEffect(() => {
    const fetchDiploma = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/diplomas/my", {
          headers: { Authorization: token }
        });

        if (res.data.status !== "περατωμένη") {
          setError("Η σελίδα αυτή αφορά μόνο περατωμένες διπλωματικές.");
          return;
        }

        setDiploma(res.data);
      } catch (err) {
        setError("Σφάλμα φόρτωσης δεδομένων");
      }
    };

    fetchDiploma();
  }, [token]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!diploma) return <p>Φόρτωση...</p>;

  return (
    <div className="container">
      <h2>🎓 Περατωμένη Διπλωματική</h2>
      <button onClick={() => navigate("/praktiko")} className="button">
        🧾 Προβολή Πρακτικού Εξέτασης
      </button>
      <div className="detail-box">
        <p><strong>Τίτλος:</strong> {diploma.title || diploma.titlos || "—"}</p>
      </div>
      <div className="detail-box">
        <p><strong>Περίληψη:</strong> {diploma.summary || diploma.perigrafi || "—"}</p>
      </div>
      <div className="detail-box">
        <p><strong>Κατάσταση:</strong> {diploma.status || diploma.katastasi}</p>
      </div>
      <div className="detail-box">
        <p><strong>Τελικός Βαθμός:</strong> {diploma.telikosVathmos ?? "—"}</p>
      </div>
      {diploma.syndesmos && (
        <div className="detail-box">
          <p><strong>Τελικό Κείμενο:</strong> <a href={diploma.syndesmos} target="_blank" rel="noreferrer">Άνοιγμα</a></p>
        </div>
      )}
     
      <h3>📜 Προηγούμενες Καταστάσεις</h3>
      <ul>
        {(diploma.proigoumenesKatastaseis || []).map((k, i) => (
          <li key={i}>{k}</li>
        ))}
      </ul>
    </div>
  );
};

export default FinishedPhase;

