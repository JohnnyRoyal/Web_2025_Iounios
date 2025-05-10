import React, { useEffect, useState } from "react";
import axios from "axios";

const GramateiaView = () => {
  const [diplomas, setDiplomas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/secretary/diplomas", {
          headers: {
            Authorization: token,
          },
        });
        setDiplomas(res.data);
      } catch (err) {
        setError("❌ Σφάλμα κατά την ανάκτηση δεδομένων.");
        console.error(err);
      }
    };

    fetchDiplomas();
  }, []);

  const handleSetAP = async (id) => {
    const protocolNumber = prompt("Εισάγετε τον αριθμό πρωτοκόλλου:");
    if (!protocolNumber) return;

    try {
      const token = localStorage.getItem("token");
      
      // Debugging
      console.log('Sending request with:', {
        id: id,
        protocolNumber: protocolNumber
      });

      const response = await axios.post(
        "http://localhost:4000/api/secretary/set-ap",
        { 
          id: id,
          protocolNumber: protocolNumber 
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Response:', response.data); // Debugging
      
      if (response.data.message) {
        alert(response.data.message);
        window.location.reload(); // Ανανέωση σελίδας μετά την επιτυχία
      }
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error details:', {
        message: err.response?.data?.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("❌ Σφάλμα κατά την καταχώρηση του αριθμού πρωτοκόλλου.");
      }
    }
  };

  // Συνάρτηση για την ακύρωση της ανάθεσης για το κουμπί "Ακύρωση Ανάθεσης"
  const handleCancelAssignment = async (id) => {
    // Ζητάμε όλα τα απαραίτητα στοιχεία
    const reason = prompt("Εισάγετε τον λόγο ακύρωσης:");
    if (!reason) return;

    const date = prompt("Εισάγετε την ημερομηνία Γενικής Συνέλευσης (YYYY-MM-DD):");
    if (!date || !isValidDate(date)) {
      alert("❌ Παρακαλώ εισάγετε έγκυρη ημερομηνία στη μορφή YYYY-MM-DD");
      return;
    }

    const meetingNumber = prompt("Εισάγετε τον αριθμό Γενικής Συνέλευσης:");
    if (!meetingNumber) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/secretary/cancel",
        { 
          id,
          logosAkyrosis: reason,
          imerominiaGenikisSyneleysis: date,
          arithmosGenikhsSynelefsisAkyrwshs: meetingNumber
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      alert("✅ Η ανάθεση ακυρώθηκε επιτυχώς!");
      // Ανανέωση της σελίδας για να φανούν οι αλλαγές
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Σφάλμα κατά την ακύρωση της ανάθεσης.");
    }
  };

  // Βοηθητική συνάρτηση για έλεγχο εγκυρότητας ημερομηνίας
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  // Συνάρτηση για την ολοκλήρωση της διπλωματικής εργασίας για το κουμπί "Ολοκλήρωση Διπλωματικής"
  const handleCompleteDiploma = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/secretary/complete",
        { id },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      alert("✅ Η διπλωματική εργασία ολοκληρώθηκε επιτυχώς!");
    } 
    catch (err) {
      if (err.response && err.response.status === 400) {
        switch (err.response.data.errorType) {
          case "NO_LINK_Nemertes":  //περίπτωση που δεν έχει καταχωρηθεί link στον Νημέτρη
            alert("❌ Δεν υπάρχει link στον Νημέτρη, πρέπει να είναι συμπληρωμένο πριν την αλλαγή κατάστασης.");
            break;
          case "NO_FINAL_GRADE":  //περίπτωση που δεν έχει καταχωρηθεί τελικός βαθμός
            alert("❌ Δεν έχει καταχωρηθεί τελικός βαθμός");
            break;
          default:
            alert(err.response.data.message);
        }
      } else {
        console.error(err);
        alert("❌ Σφάλμα κατά την αλλαγή κατάστασης της διπλωματικής εργασίας σε Περατωμένη.");
      }
    }
  };

  const activeDiplomas = diplomas.filter((diploma) => diploma.katastasi === "Ενεργή");
  const underReviewDiplomas = diplomas.filter((diploma) => diploma.katastasi === "υπό εξέταση");

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📄 Λίστα Διπλωματικών Εργασιών</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.listsContainer}>
        <div style={styles.list}>
          <h3>Ενεργές Διπλωματικές</h3>
          <ul>
            {activeDiplomas.map((diploma, index) => (
              <li key={index} style={styles.listItem}>
                <h4>{diploma.titlos}</h4>
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
                <div style={styles.buttonGroup}>
                  <button onClick={() => handleSetAP(diploma._id)} style={styles.button}>
                    Καταχώρηση ΑΠ
                  </button>
                  <button onClick={() => handleCancelAssignment(diploma._id)} style={styles.button}>
                    Ακύρωση Ανάθεσης
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.list}>
          <h3>Υπό Εξέταση Διπλωματικές</h3>
          <ul>
            {underReviewDiplomas.map((diploma, index) => (
              <li key={index} style={styles.listItem}>
                <h4>{diploma.titlos}</h4>
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
                <button onClick={() => handleCompleteDiploma(diploma._id)} style={styles.button}>
                  Ολοκλήρωση Διπλωματικής
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 1200,
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
  listsContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
  },
  list: {
    flex: 1,
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  listItem: {
    borderBottom: "1px solid #ddd",
    padding: 10,
    marginBottom: 10,
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    marginTop: 10,
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
};

export default GramateiaView;