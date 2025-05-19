// src/components/PraktikoView.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PraktikoView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/diplomas/praktiko-data", {
          headers: { Authorization: token }
        });
        setData(res.data);
      } catch {
        setError("Σφάλμα κατά τη φόρτωση του πρακτικού.");
      }
    };
    fetchData();
  }, [token]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Φόρτωση...</p>;

  const { onoma, epitheto, am, titlos, trimeriEpitropi, telikosVathmos, imerominiaOraExetasis, mainKathigitis,troposExetasis } = data;

  const formattedDate = imerominiaOraExetasis
    ? new Date(imerominiaOraExetasis).toLocaleString("el-GR", {
        dateStyle: "short",
        timeStyle: "short"
      })
    : ".... / .... / .... και ώρα: ........";

  return (
    <div style={{ padding: 40, background: "#fff" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>⬅ Επιστροφή</button>
      <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", lineHeight: "1.6" }}>
        <h2 style={{ textAlign: "center", fontWeight: "bold" }}>ΠΡΑΚΤΙΚΟ ΕΞΕΤΑΣΗΣ ΔΙΠΛΩΜΑΤΙΚΗΣ ΕΡΓΑΣΙΑΣ</h2>
        <p>
          Σήμερα στην Πάτρα στις <strong>{formattedDate}</strong> παρουσιάστηκε και εξετάστηκε ενώπιον τριμελούς επιτροπής <strong>{troposExetasis}</strong> η διπλωματική εργασία του φοιτητή/φοιτήτριας <strong>{onoma} {epitheto}</strong> με Αριθμό Μητρώου <strong>{am}</strong>, με τίτλο: <em>"{titlos}"</em>.
        </p>

        <p>και αξιολογήθηκε ως εξής:</p>

        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 20 }} border="1">
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: 8 }}>ΟΝΟΜΑΤΕΠΩΝΥΜΟ ΕΞΕΤΑΣΤΗ</th>
              <th style={{ padding: 8 }}>ΒΑΘΜΟΣ</th>
            </tr>
          </thead>
          <tbody>
            {trimeriEpitropi.map((m, i) => (
              <tr key={i}>
                <td style={{ padding: 8 }}>{m.onoma} {m.epitheto}</td>
                <td style={{ padding: 8 }}>{m.vathmos ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ marginTop: 16 }}>Μέσος όρος : <strong>{telikosVathmos ?? "........ (...)"}</strong></p>

        <p style={{ marginTop: 20 }}>
          Η Διπλωματική εργασία του/της φοιτητή/φοιτήτριας δεν αποτελεί προϊόν λογοκλοπής – πλαγιαρισμού
        </p>

        <p style={{ marginTop: 30 }}>Ο ΕΠΙΒΛΕΠΩΝ ΚΑΘΗΓΗΤΗΣ / Η ΕΠΙΒΛΕΠΟΥΣΑ ΚΑΘΗΓΗΤΡΙΑ: <strong>{mainKathigitis?.onoma} {mainKathigitis?.epitheto}</strong></p>
      </div>
    </div>
  );
};

export default PraktikoView;



