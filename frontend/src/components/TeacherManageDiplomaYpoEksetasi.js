import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const TeacherManageDiplomaYpoEksetasi = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [active, setActive] = useState(""); // "proxeiro" | "anakoinosi" | "bathmos"
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleFetch = async (type) => {
    setActive(type);
    setData(null);
    setError("");
    try {
      let res;
        if (type === "proxeiro") {
        res = await axios.post(
            "http://localhost:4000/api/teacher/diaxirisi/ypoeksetasi/proxeiro",
            { id },
            { headers: { Authorization: token } }
        );
        if (res.data.pdfProxeiroKeimeno) {
            // Αν το string ΔΕΝ ξεκινάει με http, φτιάξε το πλήρες URL
            let pdfUrl = res.data.pdfProxeiroKeimeno;
            if (!/^https?:\/\//i.test(pdfUrl)) {
            pdfUrl = `http://localhost:4000/uploads/${pdfUrl.replace(/^\/+/, "")}`;
            }
            window.open(pdfUrl, "_blank");
        } else {
            setError("Δεν υπάρχει PDF προχείρου κειμένου.");
        }
        return; // Σταματά εδώ, δεν κάνει setData
      } else if (type === "anakoinosi") {
        res = await axios.post(
          "http://localhost:4000/api/teacher/diaxirisi/ypoeksetasi/anakoinwsh",
          { id },
          { headers: { Authorization: token } }
        );
        setData(res.data);
      } else if (type === "bathmos") {
        res = await axios.post(
          "http://localhost:4000/api/teacher/diaxirisi/ypoeksetasi/bathmos",
          { id },
          { headers: { Authorization: token } }
        );
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Σφάλμα.");
    }
  };

  return (
    <div style={{
      maxWidth: 700,
      margin: "40px auto",
      padding: 24,
      border: "1px solid #ddd",
      borderRadius: 8,
      background: "#fff"
    }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>⬅ Επιστροφή</button>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Διαχείριση Διπλωματικής (Υπό Εξέταση)</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
        <button className="button" onClick={() => handleFetch("proxeiro")}>📄 Προβολή Προχείρου Κειμένου</button>
        <button className="button" onClick={() => handleFetch("anakoinosi")}>📢 Προβολή Ανακοίνωσης Εξέτασης</button>
        <button className="button" onClick={() => handleFetch("bathmos")}>📝 Προβολή Βαθμολογίας Τριμελούς</button>
      </div>

      {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}

      {/* Προβολή Ανακοίνωσης Εξέτασης */}
      {active === "anakoinosi" && data && (
        <div style={{
          marginTop: 24,
          fontFamily: "Georgia, serif",
          fontSize: "17px",
          lineHeight: "1.6",
          background: "#f8f8f8",
          padding: 24,
          borderRadius: 8
        }}>
          <h3 style={{ textAlign: "center", fontWeight: "bold" }}>ΑΝΑΚΟΙΝΩΣΗ ΕΞΕΤΑΣΗΣ</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
            {data.anakoinosiExetasis}
          </pre>
          <div style={{ marginTop: 16 }}>
            <strong>Ημερομηνία/Ώρα:</strong> {data.imerominiaOraExetasis || "-"}
            <br />
            <strong>Τρόπος:</strong> {data.troposExetasis || "-"}
            <br />
            {data.aithousaExetasis && (
              <>
                <strong>Αίθουσα:</strong> {data.aithousaExetasis}
                <br />
              </>
            )}
            {data.syndesmosExetasis && (
              <>
                <strong>Σύνδεσμος:</strong> {data.syndesmosExetasis}
                <br />
              </>
            )}
          </div>
        </div>
      )}

      {/* Προβολή Βαθμολογίας Τριμελούς */}
      {active === "bathmos" && data && (
        <div style={{ marginTop: 24 }}>
          <h3>Βαθμολογία Τριμελούς Επιτροπής</h3>
          <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 20 }} border="1">
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ padding: 8 }}>ΟΝΟΜΑΤΕΠΩΝΥΜΟ ΕΞΕΤΑΣΤΗ</th>
                <th style={{ padding: 8 }}>ΒΑΘΜΟΣ</th>
              </tr>
            </thead>
            <tbody>
              {data.trimeriEpitropi?.map((m, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{m.onoma} {m.epitheto}</td>
                  <td style={{ padding: 8 }}>{m.vathmos ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16 }}>
            Μέσος όρος : <strong>{data.telikosVathmos ?? "........ (...)"}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherManageDiplomaYpoEksetasi;