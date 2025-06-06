import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
    <div style={{ padding: 20 }}>
      <h2>📄 Λεπτομέρειες Διπλωματικής</h2>
      <p><strong>Τίτλος:</strong> {diploma.titlos}</p>
      <p><strong>Περιγραφή:</strong> {diploma.perigrafi}</p>
      <p><strong>Κατάσταση:</strong> {diploma.katastasi}</p>

      {diploma.foititis && (
        <p><strong>Φοιτητής:</strong> {diploma.foititis.onoma} {diploma.foititis.epitheto} ({diploma.foititis.arithmosMitroou})</p>
      )}

      <p><strong>Επιβλέπων:</strong> {diploma.mainKathigitis?.onoma} {diploma.mainKathigitis?.epitheto}</p>

      <p><strong>Τριμελής:</strong> {diploma.trimelisEpitropi?.map(m => `${m.onoma} ${m.epitheto}`).join(", ")}</p>

      <p><strong>📌 Κατάσταση:</strong> {diploma.katastasi}</p>

      {/* Αν περατωμένη και υπο εξεταση, δείξε βαθμό και αρχεία */}
      {(diploma.katastasi === "περατωμένη" || diploma.katastasi === "υπό εξέταση") && (
        <>

            <p><strong>Τελικός Βαθμός:</strong> {diploma.telikosVathmos ?? "—"}</p>

            <button onClick={() => navigate("/praktiko")} style={{ marginBottom: 20 }}>
            🧾 Προβολή Πρακτικού Εξέτασης
            </button>

       {diploma.telikoKeimenoPdf && (
        <p><strong>Τελικό Κείμενο:</strong> <a href={diploma.syndesmos} target="_blank" rel="noreferrer">Άνοιγμα</a></p>
      )}
        </>
      )}

    

      {/* Ιστορικό ενεργειών (αν υπάρχει πίνακας) */}
      {diploma.proigoumenesKatastaseis?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>🕒 Ιστορικό Καταστάσεων</h3>
          <ul>
            {diploma.proigoumenesKatastaseis.map((k, idx) => (
              <li key={idx}>
                ➤ {k.katastasi} στις {new Date(k.date).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeacherDiplomaDetails;
