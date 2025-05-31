// src/components/TeacherHome.js
import React from "react";
import { useNavigate } from "react-router-dom";

const TeacherHome = () => {
  const navigate = useNavigate()

    const handleLogout = () => {
    localStorage.removeItem("token"); //καθαρισε token
    navigate("/"); //γυρνα login page
  };
  

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <button onClick={handleLogout} style={{ float: "right", backgroundColor: "#c44", color: "#fff", padding: 10 }}>
        🚪 Αποσύνδεση
      </button>
      <h2>👨‍🏫 Καλωσήρθατε</h2>
      
      <button onClick={() => navigate("/teacher/themata")} style={{ marginTop: 20 }}>
        📘 Τα θέματα σας
      </button>
      
      <button onClick={() => navigate("/teacher/CreateThema")} style={{ marginTop: 20 }}>
        ➕ Δημιουργία Νέου Θέματος
      </button>

      <button onClick={() => navigate("/teacher/invites")}>📩 Προσκλήσεις Επιτροπής</button>

      <button onClick={() => navigate("/assign-thema")}>📌 Ανάθεση Θέματος σε Φοιτητή</button>



    </div>
  );
};

export default TeacherHome;
