/*// src/components/FinishedPhase.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const FinishedPhase = () => {
  const [diploma, setDiploma] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

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
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2>🎓 Περατωμένη Διπλωματική</h2>

      <p><strong>Τίτλος:</strong> {diploma.title || diploma.titlos || "—"}</p>
      <p><strong>Περίληψη:</strong> {diploma.summary || diploma.perigrafi || "—"}</p>
      <p><strong>Κατάσταση:</strong> {diploma.status || diploma.katastasi}</p>

      <h3>📋 Τελικές Πληροφορίες</h3>

      <p><strong>Τελικός Βαθμός:</strong> {diploma.telikosVathmos ?? "—"}</p>

      {diploma.telikokeimenoPdf && (
        <p><strong>Τελικό Κείμενο:</strong> <a href={diploma.telikokeimenoPdf} target="_blank" rel="noreferrer">Άνοιγμα</a></p>
      )}

      {diploma.anakoinosiExetasis && (
        <p><strong>Πρακτικό Εξέτασης:</strong> <a href={diploma.anakoinosiExetasis} target="_blank" rel="noreferrer">Άνοιγμα</a></p>
      )}

      {diploma.apofasiEpitropis && (
        <p><strong>Απόφαση Επιτροπής:</strong> {diploma.apofasiEpitropis}</p>
      )}

      {diploma.sxolia && (
        <p><strong>Τελικά Σχόλια:</strong> {diploma.sxolia}</p>
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
*/
// src/components/FinishedPhase.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2>🎓 Περατωμένη Διπλωματική</h2>

      <button onClick={() => navigate("/praktiko")} style={{ marginBottom: 20 }}>
        🧾 Προβολή Πρακτικού Εξέτασης
      </button>

      <p><strong>Τίτλος:</strong> {diploma.title || diploma.titlos || "—"}</p>
      <p><strong>Περίληψη:</strong> {diploma.summary || diploma.perigrafi || "—"}</p>
      <p><strong>Κατάσταση:</strong> {diploma.status || diploma.katastasi}</p>

      <p><strong>Τελικός Βαθμός:</strong> {diploma.telikosVathmos ?? "—"}</p>

      {diploma.telikoKeimenoPdf && (
        <p><strong>Τελικό Κείμενο:</strong> <a href={diploma.telikoKeimenoPdf} target="_blank" rel="noreferrer">Άνοιγμα</a></p>
      )}


      {diploma.sxolia && (
        <p><strong>Τελικά Σχόλια:</strong> {diploma.sxolia}</p>
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

