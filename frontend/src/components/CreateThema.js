import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateThema = () => {
  const navigate = useNavigate();
  const [titlos, setTitlos] = useState("");
  const [perigrafi, setperigrafi] = useState("");
  const [pdf, setPdf] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Δεν υπάρχει έγκυρο token");
      return;
    }

    const formData = new FormData();
    formData.append("titlos", titlos);
    formData.append("perigrafi", perigrafi);
    if (pdf) formData.append("pdfPerigrafis", pdf);

    try {
      const res = await axios.post("http://localhost:4000/api/teacher/themata", formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage(res.data.message);
      setTimeout(() => navigate("/teacher"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Σφάλμα κατά την αποστολή");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>➕ Δημιουργία Νέου Θέματος</h2>
      <form onSubmit={handleSubmit}>
        <label>Τίτλος:</label>
        <input
          type="text"
          value={titlos}
          onChange={(e) => setTitlos(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Περίγραφή:</label>
        <textarea
          value={perigrafi}
          onChange={(e) => setperigrafi(e.target.value)}
          required
          style={{ width: "100%", height: 100, marginBottom: 10 }}
        />

        <label>Ανέβασμα PDF (προαιρετικό):</label>
        <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0])} />

        <button type="submit" style={{ marginTop: 20 }}>✅ Καταχώρηση</button>
      </form>
      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
};

export default CreateThema;
