import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { useEffect } from "react";

const TeacherManageDiplomaYpoEksetasi = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [active, setActive] = useState(""); // "proxeiro" | "anakoinosi" | "bathmos"
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    quality: "",
    duration: "",
    text: "",
    presentation: ""
  });
  const [loading, setLoading] = useState(false);

  //Αποκωδικοποίηση του token για να πάρουμε το didaskonId
  let didaskonId = "";
  try {
    if (token) {
      const decoded = jwtDecode(token);
      didaskonId = decoded.id || decoded.didaskonId || "";
    }
  } catch (e) {
    didaskonId = "";
  }

  useEffect(() => {
    // Αυτό το fetch γίνεται στην αρχή για να έχεις πάντα τη λίστα
    const fetchBathmos = async () => {
      try {
        const res = await axios.post(
          "http://localhost:4000/api/teacher/diaxirisi/ypoeksetasi/bathmos",
          { id },
          { headers: { Authorization: token } }
        );
        setData(res.data);
      } catch (err) {
        // Δεν εμφανίζουμε error εδώ για να μην δείχνει μήνυμα πριν πατήσει ο χρήστης το κουμπί
      }
    };
    fetchBathmos();
  }, [id, token]);

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
          let pdfUrl = res.data.pdfProxeiroKeimeno;
          if (!/^https?:\/\//i.test(pdfUrl)) {
            pdfUrl = `http://localhost:4000/uploads/${pdfUrl.replace(/^\/+/, "")}`;
          }
          window.open(pdfUrl, "_blank");
        } else {
          setError("Δεν υπάρχει PDF προχείρου κειμένου.");
        }
        return;
      } else if (type === "anakoinosi") {
        res = await axios.post(
          "http://localhost:4000/api/teacher/diaxirisi/ypoeksetasi/anakoinwsh",
          { id },
          { headers: { Authorization: token } }
        );
        setData(res.data);
      } else if (type === "bathmos") {
        setActive("bathmos");
        // Δεν χρειάζεται να ξανακάνεις fetch, το κάνει το useEffect
      }
    } catch (err) {
      setError(err.response?.data?.message || "Σφάλμα.");
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:4000/api/teacher/diaxirisi/ypoeksetasi/bathmos",
        {
          id,
          quality: Number(form.quality),
          duration: Number(form.duration),
          text: Number(form.text),
          presentation: Number(form.presentation)
        },
        { headers: { Authorization: token } }
      );
      setData(res.data);
      setForm({
        quality: "",
        duration: "",
        text: "",
        presentation: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Σφάλμα.");
    }
    setLoading(false);
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


      {/* Λίστα τριμελούς και βαθμοί */}
      {data && (
        <div style={{ marginTop: 24 }}>
          <h3>Βαθμολογία Τριμελούς Επιτροπής</h3>
          <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 20 }} border="1">
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ padding: 8 }}>ΟΝΟΜΑΤΕΠΩΝΥΜΟ ΕΞΕΤΑΣΤΗ</th>
                <th style={{ padding: 8 }}>Ποιότητα</th>
                <th style={{ padding: 8 }}>Διάρκεια</th>
                <th style={{ padding: 8 }}>Κείμενο</th>
                <th style={{ padding: 8 }}>Παρουσίαση</th>
                <th style={{ padding: 8 }}>Ζυγισμένος Μέσος Όρος</th>
              </tr>
            </thead>
            <tbody>
              {data.trimelisEpitropi?.map((m, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{m.onoma} {m.epitheto}</td>
                  <td style={{ padding: 8 }}>
                    {m.vathmosAnalytika?.quality ?? "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    {m.vathmosAnalytika?.duration ?? "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    {m.vathmosAnalytika?.text ?? "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    {m.vathmosAnalytika?.presentation ?? "-"}
                  </td>
                  <td style={{ padding: 8 }}>{m.vathmos ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16 }}>
            Τελικός βαθμός (μέσος όρος τριμελούς): <strong>{data.telikosVathmos ?? "........ (...)"}</strong>
          </p>
        </div>
      )}

      {active === "bathmos" && (
        <div style={{ marginTop: 24 }}>
          <h3>Βαθμολογία Τριμελούς Επιτροπής</h3>

          {/* Έλεγχος αν έχει ήδη καταχωρηθεί βαθμός */}
          {data && (() => {
            const hasVoted = !!data.trimelisEpitropi.find(
              m => m.didaskonId === didaskonId && m.vathmos !== undefined && m.vathmos !== null
            );
            if (hasVoted) {
              return (
                <div style={{ color: "green", marginBottom: 20 }}>
                  Έχετε ήδη καταχωρήσει βαθμό για αυτή τη διπλωματική.
                </div>
              );
            } else {
              return (
                <>
                  {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}
                  <form onSubmit={handleSubmit} style={{ marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <label>Ποιότητα (0-10):<br />
                        <input
                          type="number"
                          name="quality"
                          min="0"
                          max="10"
                          step="0.1"
                          value={form.quality}
                          onChange={handleInputChange}
                          required
                          style={{ width: 70 }}
                        />
                      </label>
                    </div>
                    <div>
                      <label>Διάρκεια (0-10):<br />
                        <input
                          type="number"
                          name="duration"
                          min="0"
                          max="10"
                          step="0.1"
                          value={form.duration}
                          onChange={handleInputChange}
                          required
                          style={{ width: 70 }}
                        />
                      </label>
                    </div>
                    <div>
                      <label>Κείμενο (0-10):<br />
                        <input
                          type="number"
                          name="text"
                          min="0"
                          max="10"
                          step="0.1"
                          value={form.text}
                          onChange={handleInputChange}
                          required
                          style={{ width: 70 }}
                        />
                      </label>
                    </div>
                    <div>
                      <label>Παρουσίαση (0-10):<br />
                        <input
                          type="number"
                          name="presentation"
                          min="0"
                          max="10"
                          step="0.1"
                          value={form.presentation}
                          onChange={handleInputChange}
                          required
                          style={{ width: 70 }}
                        />
                      </label>
                    </div>
                    <div style={{ alignSelf: "flex-end" }}>
                      <button type="submit" className="button" disabled={loading}>
                        {loading ? "Αποθήκευση..." : "Αποθήκευση Βαθμών"}
                      </button>
                    </div>
                  </form>
                </>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default TeacherManageDiplomaYpoEksetasi;