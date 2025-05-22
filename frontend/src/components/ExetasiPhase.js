// src/components/ExetasiPhase.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const ExetasiPhase = () => {
  const [syndesmos, setSyndesmos] = useState(""); //new
  const [linkMsg, setLinkMsg] = useState(""); //new
  const navigate = useNavigate(); 
  const [data, setData] = useState(null); 
  const [draftForm, setDraftForm] = useState({
    pdfProxeiroKeimeno: "",
    linkYliko: ""
  });
  const [examForm, setExamForm] = useState({
    imerominiaOraExetasis: "",
    troposExetasis: "",
    aithousaExetasis: "",
    syndesmosExetasis: ""
  });
  const [msg, setMsg] = useState({ draft: "", exam: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDiploma = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/diplomas/my", {
          headers: { Authorization: token }
        });
        setData(res.data);
        setDraftForm({
          pdfProxeiroKeimeno: res.data.pdfProxeiroKeimeno || "",
          linkYliko: res.data.linkYliko || ""
        });
        setExamForm({
          imerominiaOraExetasis: res.data.imerominiaOraExetasis?.slice(0, 16) || "",
          troposExetasis: res.data.troposExetasis || "",
          aithousaExetasis: res.data.aithousaExetasis || "",
          syndesmosExetasis: res.data.syndesmosExetasis || ""
        });
        setSyndesmos(res.data.syndesmos || "");
      } catch {
        setMsg({ draft: "Σφάλμα φόρτωσης", exam: "Σφάλμα φόρτωσης" });
      }
    };
    fetchDiploma();
  }, []);

  const handleSaveDraft = async () => {
    setMsg(prev => ({ ...prev, draft: "" }));
    try {
      await axios.put("http://localhost:4000/api/diplomas/upload-draft", draftForm, {
        headers: { Authorization: token }
      });
      setMsg(prev => ({ ...prev, draft: "Αποθηκεύτηκε επιτυχώς." }));
    } catch {
      setMsg(prev => ({ ...prev, draft: "Σφάλμα αποθήκευσης πρόχειρου." }));
    }
  };

  const handleSaveExam = async () => {
    setMsg(prev => ({ ...prev, exam: "" }));
    try {
      await axios.put("http://localhost:4000/api/diplomas/set-exam-info", examForm, {
        headers: { Authorization: token }
      });
      setMsg(prev => ({ ...prev, exam: "Τα στοιχεία εξέτασης αποθηκεύτηκαν." }));
    } catch {
      setMsg(prev => ({ ...prev, exam: "Σφάλμα αποθήκευσης εξέτασης." }));
    }
  };

  const saveSyndesmos = async () => {
  setLinkMsg("");
  try {
    await axios.put("http://localhost:4000/api/diplomas/upload-link", { syndesmos }, {
      headers: { Authorization: token }
    });
    setLinkMsg("✅ Ο σύνδεσμος αποθηκεύτηκε.");
  } catch {
    setLinkMsg("❌ Σφάλμα κατά την αποθήκευση του συνδέσμου.");
  }
};


  if (!data) return <p>Φόρτωση...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h3>📑 Φάση Υπό Εξέταση</h3>

      <button onClick={() => navigate("/praktiko")}>
      🧾 Προβολή Πρακτικού Εξέτασης
        </button>

      <hr />
      <h4>🔗 Τελικός Σύνδεσμος προς Νημερτή</h4>
      <label>Καταχωρήστε τον τελικό σύνδεσμο προς το αποθετήριο της βιβλιοθήκης (Νημερτής):</label><br />
      <input
       type="text"
        value={syndesmos}
        onChange={e => setSyndesmos(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
        /><br />
        <button onClick={saveSyndesmos}>💾 Αποθήκευση Συνδέσμου</button>
          {linkMsg && <p style={{ color: linkMsg.includes("❌") ? "red" : "green" }}>{linkMsg}</p>}

      <h4>📄 Πρόχειρο Κείμενο</h4>
      <label>PDF link:</label>
      <input value={draftForm.pdfProxeiroKeimeno} onChange={e => setDraftForm({ ...draftForm, pdfProxeiroKeimeno: e.target.value })} /><br /><br />
      <label>Σύνδεσμος Υλικού:</label>
      <input value={draftForm.linkYliko} onChange={e => setDraftForm({ ...draftForm, linkYliko: e.target.value })} /><br /><br />
      <button onClick={handleSaveDraft}>💾 Αποθήκευση Πρόχειρου</button>
      {msg.draft && <p style={{ color: msg.draft.includes("Σφάλμα") ? "red" : "green" }}>{msg.draft}</p>}

      <hr />
      <h4>🕒 Στοιχεία Εξέτασης</h4>
      <label>Ημερομηνία & Ώρα:</label>
      <input type="datetime-local" value={examForm.imerominiaOraExetasis} onChange={e => setExamForm({ ...examForm, imerominiaOraExetasis: e.target.value })} /><br /><br />
      <label>Τρόπος Εξέτασης:</label>
      <select value={examForm.troposExetasis} onChange={e => setExamForm({ ...examForm, troposExetasis: e.target.value })}>
        <option value="">-- Επιλέξτε --</option>
        <option value="από κοντά">Από κοντά</option>
        <option value="εξ αποστάσεως">Εξ αποστάσεως</option>
      </select><br /><br />

      {examForm.troposExetasis === "από κοντά" && (
        <>
          <label>Αίθουσα:</label>
          <input value={examForm.aithousaExetasis} onChange={e => setExamForm({ ...examForm, aithousaExetasis: e.target.value })} /><br /><br />
        </>
      )}
      {examForm.troposExetasis === "εξ αποστάσεως" && (
        <>
          <label>Σύνδεσμος Εξέτασης:</label>
          <input value={examForm.syndesmosExetasis} onChange={e => setExamForm({ ...examForm, syndesmosExetasis: e.target.value })} /><br /><br />
        </>
      )}

      <button onClick={handleSaveExam}>💾 Αποθήκευση Εξέτασης</button>
      {msg.exam && <p style={{ color: msg.exam.includes("Σφάλμα") ? "red" : "green" }}>{msg.exam}</p>}

    
    </div>
  );
};

export default ExetasiPhase;
