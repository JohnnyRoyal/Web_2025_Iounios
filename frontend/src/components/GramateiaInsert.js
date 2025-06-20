import React, { useState } from "react";
import axios from "axios";
import "./GramateiaInsert.css"; // Εισαγωγή του νέου CSS

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
    <div className="insert-container">
      <h2>📥 Εισαγωγή Δεδομένων</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={handleUpload}>Υποβολή</button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div>
        <h3>Παράδειγμα JSON Αρχείου:</h3>
        <pre>
          {`{
    "students": [
        {
            "username": "test.testaki",
            "password": "hashed_testaki",
            "email": "test.testaki@example.com",
            "taxydromikiDieythinsi": "Τεστ 5, Λάρισα",
            "kinito": "6900000019",
            "stathero": "2410000019",
            "arithmosMitroou": 12345678,
            "onoma": "Τεστ",
            "epitheto": "Τεστακης"
        }
    ],
    "Didaskontes": [
        {
        "username": "a.testopoulou",
        "password": "hashed_pass_test",
        "proskliseis": [],
        "didaskonId": 12345,
        "epitheto": "Τεστοπούλου",
        "onoma": "Τεστά"
        }
    ]
}`}
        </pre>
      </div>
    </div>
  );
};

export default GramateiaInsert;