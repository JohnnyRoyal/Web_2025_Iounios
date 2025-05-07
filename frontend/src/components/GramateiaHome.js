import React from "react";
import { useNavigate } from "react-router-dom";

const GramateiaHome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Καλωσήρθατε στη Γραμματεία!</h2>
      <div style={styles.menu}>
        <button onClick={() => navigate("/diplomas")} style={styles.button}>
          📄 Προβολή Διπλωματικών
        </button>
        <button onClick={() => navigate("/data-entry")} style={styles.button}>
          📝 Εισαγωγή Δεδομένων
        </button>
        <button onClick={() => navigate("/active-thesis")} style={styles.button}>
          🛠 Διαχείριση Ενεργής Διπλωματικής Εργασίας
        </button>
        <button onClick={() => navigate("/under-review-thesis")} style={styles.button}>
          🔍 Διαχείριση Υπό Εξέτασης Διπλωματικής Εργασίας
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 24,
    textAlign: "center",
    maxWidth: 600,
    margin: "auto"
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: 32
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  button: {
    fontSize: "1.1rem",
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #ddd",
    backgroundColor: "#f2f2f2",
    cursor: "pointer",
    transition: "0.2s",
    textAlign: "center"
  }
};

export default GramateiaHome;