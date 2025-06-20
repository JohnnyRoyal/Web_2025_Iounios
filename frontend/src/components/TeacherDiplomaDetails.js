import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./TeacherDiplomas.css"; // Προσθήκη στυλ

const TeacherDiplomaDetails = () => {
  const { id } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiploma = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/teacher/diplomatikes/${id}`, {
          headers: { Authorization: token }
        });
        setDiploma(res.data);
      } catch (err) {
        setMessage("❌ Σφάλμα ανάκτησης");
      }
    };
    fetchDiploma();
  }, [id, token]);

  if (!diploma) return <p>{message || "Φόρτωση..."}</p>;


  
  return (
    <div className="container">
      <h2 className="heading">📄 Λεπτομέρειες Διπλωματικής</h2>
      {/* Κουτί: Βασικά στοιχεία */}
      <div className="list">
        <p><strong>Τίτλος:</strong> {diploma.titlos}</p>
        <p><strong>Περιγραφή:</strong> {diploma.perigrafi}</p>
        <p><strong>Κατάσταση:</strong> {diploma.katastasi}</p>
        {diploma.foititis && (
          <p><strong>Φοιτητής:</strong> {diploma.foititis.onoma} {diploma.foititis.epitheto} ({diploma.foititis.arithmosMitroou})</p>
        )}
        <p><strong>Επιβλέπων:</strong> {diploma.mainKathigitis?.onoma} {diploma.mainKathigitis?.epitheto}</p>
        <p><strong>Τριμελής:</strong> {diploma.trimelisEpitropi?.map(m => `${m.onoma} ${m.epitheto}`).join(", ")}</p>
      </div>

      {/* Κουτί: Τελικό Κείμενο */}
      {(diploma.katastasi === "περατωμένη" || diploma.katastasi === "υπό εξέταση") && diploma.telikoKeimenoPdf && (
        <div className="list">
          <p><strong>Τελικός Βαθμός:</strong> {diploma.telikosVathmos ?? "—"}</p>
          <p>
            <strong>Τελικό Κείμενο:</strong>{" "}
            <a href={diploma.syndesmos} target="_blank" rel="noreferrer">
              Άνοιγμα
            </a>
          </p>
          <button
            className="button"
            style={{ marginBottom: 20 }}
            onClick={() => navigate("/praktiko")}
          >
            🧾 Προβολή Πρακτικού Εξέτασης
          </button>
        </div>
      )}

      {/* Κουτί: Ιστορικό Καταστάσεων */}
      {diploma.proigoumenesKatastaseis?.length > 0 && (
        <div className="list">
          <h3>🕒 Ιστορικό Καταστάσεων</h3>
          <ul>
            {diploma.proigoumenesKatastaseis.map((k, idx) => (
              <li key={idx}>
                ➤ {k} 
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeacherDiplomaDetails;
