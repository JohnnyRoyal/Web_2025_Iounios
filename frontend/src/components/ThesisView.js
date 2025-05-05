import React, { useEffect, useState } from "react";
import axios from "axios";

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
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2>📄 Διπλωματική Εργασία</h2>
      <p><strong>Τίτλος:</strong> {data.title}</p>
      {data.summary && <p><strong>Περιγραφή:</strong> {data.summary}</p>}
      {data.pdf_url && (
        <p>
          <strong>Περιγραφή PDF:</strong>{" "}
          <a href={data.pdf_url} target="_blank" rel="noopener noreferrer">
            Άνοιγμα
          </a>
        </p>
      )}
      <p><strong>Κατάσταση:</strong> {data.status}</p>
      {data.assignment_date ? (
        <p><strong>Ημερομηνία Ανάθεσης:</strong> {new Date(data.assignment_date).toLocaleDateString("el-GR")}</p>
        ) : (
        <p><strong>Ημερομηνία Ανάθεσης:</strong> Δεν έχει οριστεί</p>
        )}

      {data.time_since_assignment && (
        <p><strong>Μέρες από ανάθεση:</strong> {data.time_since_assignment}</p>
      )}

      {data.committee && (
        <>
          <h3>👨‍🏫 Τριμελής Επιτροπή</h3>
          <ul>
            {data.committee.map((m, i) => (
              <li key={i}>{m.onoma} {m.epitheto}</li>
            ))}
          </ul>
        </>
      )}

      {/*{data.praktikoHTML && (
        <>
          <h3>📜 Πρακτικό Εξέτασης</h3>
          <div dangerouslySetInnerHTML={{ __html: data.praktikoHTML }} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }} />
        </>
      )}*/}
    </div>
  );
};

export default ThesisView;
