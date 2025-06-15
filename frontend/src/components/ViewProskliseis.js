import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ViewProskliseis = () => {
  const [proskliseis, setProskliseis] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const { id } = useParams();  //Πάρε το ID από το URL

  useEffect(() => {
    axios.get(`http://localhost:4000/api/teacher/ProskliseisThematos/${id}`, {
      headers: { Authorization: token }
    }).then(res => {
      setProskliseis(res.data.proskliseis);
    }).catch(() => setError("❌ Αποτυχία ανάκτησης προσκλήσεων."));
  }, [id,token]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h3>📨 Προσκλήσεις Μελών Τριμελούς</h3>
      {proskliseis.length === 0 && <p>Δεν υπάρχουν προσκλήσεις.</p>}
      {proskliseis.map((p, i) => (
        <div key={i} style={{ borderBottom: "1px solid #ccc", marginBottom: 8 }}>
          <p><strong>Όνομα:</strong> {p.onoma} {p.epitheto}</p>
          <p><strong>Ημερ. Πρόσκλησης:</strong> {new Date(p.imerominiaProsklisis).toLocaleString()}</p>
          <p><strong>Ημερ. Αποδοχής:</strong> {p.imerominiaApodoxis ? new Date(p.imerominiaApodoxis).toLocaleString() : "—"}</p>
          <p><strong>Ημερ. Απόρριψης:</strong> {p.imerominiaAporripsis ? new Date(p.imerominiaAporripsis).toLocaleString() : "—"}</p>
        </div>
      ))}
    </div>
  );
};

export default ViewProskliseis;
