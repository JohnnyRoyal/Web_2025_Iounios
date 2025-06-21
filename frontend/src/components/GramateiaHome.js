import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudentHome.css"; // Css από το StudentHome.js

const GramateiaHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Καθαρισμός token
    navigate("/"); // Επιστροφή στη σελίδα σύνδεσης
  };

  return (
    <div className="student-home-container">
      <div className="logoutContainer">
        <button onClick={handleLogout} className="button-cancel">🚪 Αποσύνδεση</button>
      </div>

      <h2>Καλωσήρθατε στη Γραμματεία!</h2>
      <div className="student-menu">
        <button onClick={() => navigate("/diplomas")}>📄 Προβολή Διπλωματικών</button>
        <button onClick={() => navigate("/data-entry")}>📝 Εισαγωγή Δεδομένων</button>
      </div>
    </div>
  );
};

export default GramateiaHome;