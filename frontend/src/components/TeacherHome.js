// src/components/TeacherHome.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudentHome.css"; // Χρήση του CSS από το StudentHome.js

const TeacherHome = () => {
  const navigate = useNavigate()

    const handleLogout = () => {
    localStorage.removeItem("token"); //καθαρισε token
    navigate("/"); //γυρνα login page
  };
  

  return (
    <div className="student-home-container">
      <div className="logoutContainer">
        <button onClick={handleLogout} className="logoutButton">🚪 Αποσύνδεση</button>
      </div>

      <h2>Καλωσήρθατε, Καθηγητή!</h2>
      <div className="student-menu">
        <button onClick={() => navigate("/teacher/themata")}>📘 Τα θέματα σας</button>
        <button onClick={() => navigate("/teacher/CreateThema")}>➕ Δημιουργία Νέου Θέματος</button>
        <button onClick={() => navigate("/teacher/invites")}>📩 Προσκλήσεις Επιτροπής</button>
        <button onClick={() => navigate("/assign-thema")}>📌 Ανάθεση Θέματος σε Φοιτητή</button>
        <button onClick={() => navigate("/ProfessorDiplomas")}>📄 Προβολή λίστας διπλωματικών</button>
      </div>
    </div>
  );
};

export default TeacherHome;
