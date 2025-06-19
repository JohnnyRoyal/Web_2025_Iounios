import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./TeacherDiplomas.css";

const ViewProskliseis = () => {
  const [proskliseis, setProskliseis] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const { id } = useParams();

  useEffect(() => {
    axios.get(`http://localhost:4000/api/teacher/ProskliseisThematos/${id}`, {
      headers: { Authorization: token }
    }).then(res => {
      setProskliseis(res.data.proskliseis);
    }).catch(() => setError("❌ Αποτυχία ανάκτησης προσκλήσεων."));
  }, [id, token]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <h3 className="heading">📨 Προσκλήσεις Μελών Τριμελούς</h3>
      <div className="list">
        {proskliseis.length === 0 && <p>Δεν υπάρχουν προσκλήσεις.</p>}
        {proskliseis.map((p, i) => (
          <div key={i} className="list-item">
            <p><strong>Όνομα:</strong> {p.onoma} {p.epitheto}</p>
            <p><strong>Ημερ. Πρόσκλησης:</strong> {new Date(p.imerominiaProsklisis).toLocaleString()}</p>
            <p><strong>Ημερ. Αποδοχής:</strong> {p.imerominiaApodoxis ? new Date(p.imerominiaApodoxis).toLocaleString() : "—"}</p>
            <p><strong>Ημερ. Απόρριψης:</strong> {p.imerominiaAporripsis ? new Date(p.imerominiaAporripsis).toLocaleString() : "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewProskliseis;
