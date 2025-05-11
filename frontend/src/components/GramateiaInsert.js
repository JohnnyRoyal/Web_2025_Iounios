import React, { useState } from "react";
import axios from "axios";

const GramateiaInsert = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("❌ Παρακαλώ επιλέξτε ένα αρχείο JSON.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result); // Μετατροπή του αρχείου σε JSON
        const token = localStorage.getItem("token"); // Λήψη του token από το localStorage

        const res = await axios.post("http://localhost:4000/api/secretary/eisagwgh", jsonData, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        setMessage("✅ Τα δεδομένα εισήχθησαν επιτυχώς!");
        setError("");
      } catch (err) {
        setError("❌ Σφάλμα κατά την εισαγωγή δεδομένων. Ελέγξτε τη μορφή του αρχείου.");
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📥 Εισαγωγή Δεδομένων</h2>
      <input type="file" accept=".json" onChange={handleFileChange} style={styles.input} />
      <button onClick={handleUpload} style={styles.button}>
        Υποβολή
      </button>
      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.example}>
        <h3>Παράδειγμα JSON Αρχείου:</h3>
        <pre style={styles.code}>
          {`{
  "students": [
    {
      "onoma": "MakisTest",
      "epitheto": "MakopoulosTestopoulos",
      "username": "test.testopoulos",
      "email": "10433999@students.upatras.gr"
    }
  ],
  "professors": [
    {
      "onoma": "AndreasTest",
      "epitheto": "KomninosTestopoulos",
      "email": "akomninos@ceid.upatras.gr",
      "username": "testakis.testaras"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 600,
    margin: "auto",
    textAlign: "center",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 5,
  },
  success: {
    color: "green",
    marginTop: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  example: {
    marginTop: 20,
    textAlign: "left",
  },
  code: {
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 5,
    fontSize: "0.9rem",
    overflowX: "auto",
  },
};

export default GramateiaInsert;