import React, { useEffect, useState } from "react";
import axios from "axios";

const GramateiaView = () => {
  const [diplomas, setDiplomas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const token = localStorage.getItem("token"); // Λήψη του token από το localStorage
        const res = await axios.get("http://localhost:4000/api/secretary/diplomas", {
          headers: {
            Authorization: token,
          },
        });
        setDiplomas(res.data); // Αποθήκευση των δεδομένων στη λίστα
      } catch (err) {
        setError("❌ Σφάλμα κατά την ανάκτηση δεδομένων.");
        console.error(err);
      }
    };

    fetchDiplomas();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📄 Λίστα Διπλωματικών Εργασιών</h2>
      {error && <p style={styles.error}>{error}</p>}
      <ul style={styles.list}>
        {diplomas.map((diploma, index) => (
          <li key={index} style={styles.listItem}>
            <h3>{diploma.titlos}</h3>
            <p><strong>Περιγραφή:</strong> {diploma.perigrafi}</p>
            <p><strong>Κατάσταση:</strong> {diploma.katastasi}</p>
            <p><strong>Χρόνος από Ανάθεση:</strong> {diploma.xronosApoAnathesi}</p>
            <p><strong>Τριμελής Επιτροπή:</strong></p>
            <ul>
              {diploma.trimerisEpitropi.map((member, idx) => (
                <li key={idx}>
                  {member.onoma} {member.epitheto} {member.vathmos && `(Βαθμός: ${member.vathmos})`}
                </li>
              ))}
            </ul>
            {diploma.pdf_extra_perigrafh && (
              <p>
                <strong>Πρόσθετη Περιγραφή:</strong>{" "}
                <a href={diploma.pdf_extra_perigrafh} target="_blank" rel="noopener noreferrer">
                  Προβολή PDF
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: "auto",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: 20,
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  listItem: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
};

export default GramateiaView;