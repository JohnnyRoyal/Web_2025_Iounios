import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ThesisView.css"; // Προσθήκη CSS για στυλ

const ThesisView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchThesis = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/diplomas/my", {
          headers: { Authorization: token }
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Σφάλμα ανάκτησης δεδομένων");
      }
    };
    fetchThesis();
  }, []);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!data) return <p>Φόρτωση...</p>;

  return (
    <div className="thesis-container">
      <h2>📄 Διπλωματική Εργασία</h2>
      <div className="thesis-item">
        <div className="thesis-detail">
          <p><strong>Τίτλος:</strong> {data.title}</p>
        </div>
        {data.summary && (
          <div className="thesis-detail">
            <p><strong>Περιγραφή:</strong> {data.summary}</p>
          </div>
        )}
        {data.pdf_url && (
          <div className="thesis-detail">
            <p>
              <strong>Περιγραφή PDF:</strong>{" "}
              <a href={data.pdf_url} target="_blank" rel="noopener noreferrer">
                Άνοιγμα
              </a>
            </p>
          </div>
        )}
        <div className="thesis-detail">
          <p><strong>Κατάσταση:</strong> {data.status}</p>
        </div>
        {data.assignment_date ? (
          <div className="thesis-detail">
            <p><strong>Ημερομηνία Ανάθεσης:</strong> {new Date(data.assignment_date).toLocaleDateString("el-GR")}</p>
          </div>
        ) : (
          <div className="thesis-detail">
            <p><strong>Ημερομηνία Ανάθεσης:</strong> Δεν έχει οριστεί</p>
          </div>
        )}
        {data.time_since_assignment && (
          <div className="thesis-detail">
            <p><strong>Μέρες από ανάθεση:</strong> {data.time_since_assignment}</p>
          </div>
        )}
      </div>
      {data.committee && (
        <div className="thesis-item committee-list">
          <h3>👨‍🏫 Τριμελής Επιτροπή</h3>
          <ul>
            {data.committee.map((m, i) => (
              <li key={i}>{m.onoma} {m.epitheto}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default ThesisView;
