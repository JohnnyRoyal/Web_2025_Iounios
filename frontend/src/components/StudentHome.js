import React from "react";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); //καθαρισε token
    navigate("/"); //γυρνα login page
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoutContainer}>
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Αποσύνδεση
        </button>
      </div>

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
    margin: "auto",
    position: "relative"
  },
  logoutContainer: {
    textAlign: "right",
    marginBottom: 16
  },
  logoutButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: "bold"
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

