import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const TeacherManageDiplomaYpoEksetasi = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [active, setActive] = useState(""); // αρχικά τίποτα
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    quality: "",
    duration: "",
    text: "",
    presentation: ""
  });
  const [loading, setLoading] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);

  // Για debug: δες τι επιστρέφει το backend κάθε φορά που αλλάζει το data
  React.useEffect(() => {
    console.log("data", data);
  }, [data]);

  const handleFetch = async (type) => {
    setActive(type);
    setError("");
    setShowGradeForm(false); // Κρύψε τη φόρμα όταν αλλάζεις tab
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
      setShowGradeForm(false); // Κλείσε τη φόρμα μετά την αποθήκευση
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

      {/* Προβολή Ανακοίνωσης Εξέτασης */}
      {active === "anakoinosi" && (
        <div style={{ marginTop: 24 }}>
          {!data && <div>Φόρτωση...</div>}
          {data && (
            <div style={{
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
        </div>
      )}

      {/* Λίστα τριμελούς και κουμπί καταχώρησης βαθμού */}
      {active === "bathmos" && (
        <div style={{ marginTop: 24 }}>
          {!data && <div>Φόρτωση...</div>}
          {data && (
            <>
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

              {/* Κουμπί καταχώρησης βαθμού */}
              {!showGradeForm && (
                <button
                  className="button"
                  style={{ marginTop: 24 }}
                  onClick={() => setShowGradeForm(true)}
                >
                  Καταχώρηση Βαθμού
                </button>
              )}

              {/* Η φόρμα εμφανίζεται μόνο όταν πατήσεις το κουμπί */}
              {showGradeForm && (
                <>
                  {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}
                  <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                        {loading ? "Αποθήκευση..." : "Οριστική Αποθήκευση"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherManageDiplomaYpoEksetasi;