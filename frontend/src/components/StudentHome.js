import React from "react";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Καλωσήρθατε!</h2>
      <div style={styles.menu}>
        <button onClick={() => navigate("/thesis")} style={styles.button}>
          📄 Προβολή Θέματος
        </button>
        <button onClick={() => navigate("/profile")} style={styles.button}>
          🧾 Επεξεργασία Προφίλ
        </button>
        <button onClick={() => navigate("/diploma")} style={styles.button}>
          🛠 Διαχείριση Διπλωματικής
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
    transition: "0.2s"
  }
};

export default StudentHome;
