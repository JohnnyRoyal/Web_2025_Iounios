import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherDiplomas.css";

const TeacherDiplomas = () => {
  const [diplomas, setDiplomas] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  //CSV και JSON
  const exportData = (format) => {
  if (diplomas.length === 0) {
    setMessage("⚠️ Δεν υπάρχουν δεδομένα για εξαγωγή.");
    return;
  }

  if (format === "json") {
    const blob = new Blob([JSON.stringify(diplomas, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diplomatikes.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else if (format === "csv") {
    const headers = Object.keys(diplomas[0]).join(",");
    const rows = diplomas.map(d =>
      Object.values(d).map(val =>
        typeof val === "object" ? JSON.stringify(val) : `"${val}"`
      ).join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diplomatikes.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const params = {};
        if (statusFilter) params.katastasi = statusFilter;
        if (roleFilter) params.rolos = roleFilter;

        const res = await axios.get("http://localhost:4000/api/teacher/diplomatikes", {
          headers: { Authorization: token },
          params
        });
        setDiplomas(res.data);
      } catch (err) {
        setMessage("❌ Σφάλμα φόρτωσης διπλωματικών");
      }
    };
    fetchDiplomas();
  }, [token, statusFilter, roleFilter]);

  
  return (
    <div className="container">
      <h2 className="heading">📘 Οι Διπλωματικές μου</h2>

      <div className="filters-container">
        <div>
          <label>Κατάσταση:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">-- Όλες --</option>
            <option value="υπό ανάθεση">Υπό Ανάθεση</option>
            <option value="Ενεργή">Ενεργή</option>
            <option value="υπό εξέταση">Υπό Εξέταση</option>
            <option value="περατωμένη">Περατωμένη</option>
            <option value="ακυρωμένη">Ακυρωμένη</option>
          </select>
        </div>

        <div>
          <label>Ρόλος:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">-- Όλοι --</option>
            <option value="epivlepon">Επιβλέπων</option>
            <option value="melos">Μέλος Τριμελούς</option>
          </select>
        </div>
      </div>

      <div className="export-buttons">
        <button onClick={() => exportData("json")} className="button">📄 Εξαγωγή σε JSON</button>
        <button onClick={() => exportData("csv")} className="button">📑 Εξαγωγή σε CSV</button>
      </div>

      {message && <p className="error">{message}</p>}

      {diplomas.length === 0 && <p>Δεν βρέθηκαν διπλωματικές</p>}

      {diplomas.map((d) => (
        <div key={d._id} className="list">
          <p><strong>Τίτλος:</strong> {d.titlos}</p>
          <p><strong>Κατάσταση:</strong> {d.katastasi}</p>
          {d.foititis && (
            <p><strong>Φοιτητής:</strong> {d.foititis.onoma} {d.foititis.epitheto} ({d.foititis.arithmosMitroou})</p>
          )}
          <p><strong>Επιβλέπων:</strong> {d.mainKathigitis?.onoma} {d.mainKathigitis?.epitheto}</p>
          <p><strong>Τριμελής:</strong> {d.trimelisEpitropi?.map((m) => `${m.onoma} ${m.epitheto}`).join(", ")}</p>
          <button onClick={() => navigate(`/diploma/${d._id}`)} className="button">📄 Προβολή Πληροφοριών</button>
          {d.katastasi === "υπό ανάθεση" && (
            <button
              onClick={() => navigate(`/teacher-manage-diploma-ypo-anathesi/${d._id}`)}
              className="button"
            >
              🛠️ Διαχείριση Διπλωματικής Εργασίας
            </button>
          )}

          {d.katastasi === "Ενεργή" && (
            <button
              onClick={() => navigate(`/teacher-manage-diploma-energi/${d._id}`)}
              className="button"
            >
              🛠️ Διαχείριση Διπλωματικής Εργασίας
            </button>
          )}

          {d.katastasi === "υπό εξέταση" && (
            <button
              onClick={() => navigate(`/teacher-manage-diploma-ypo-eksetasi/${d._id}`)}
              className="button"
            >
              🛠️ Διαχείριση Διπλωματικής Εργασίας
            </button>
          )}

    

        </div>
      ))}
    </div>
  );
};

export default TeacherDiplomas;
