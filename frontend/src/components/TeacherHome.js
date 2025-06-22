import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentHome.css";

const TeacherHome = () => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/teacher/me", {
          headers: { Authorization: token }
        });
        setTeacher(res.data);
      } catch (err) {
        console.error("Σφάλμα κατά την ανάκτηση στοιχείων καθηγητή");
      }
    };

    fetchTeacher();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="student-home-container">
      <div className="logoutContainer">
        <button onClick={handleLogout} className="button-cancel">
          🚪 Αποσύνδεση
        </button>
      </div>
            
        <h2>Καλωσήρθατε, {teacher?.onoma} {teacher?.epitheto}!</h2>

      <div className="student-menu">
        <button onClick={() => navigate("/teacher/themata")}>📘 Τα θέματα σας</button>
        <button onClick={() => navigate("/teacher/CreateThema")}>➕ Δημιουργία Νέου Θέματος</button>
        <button onClick={() => navigate("/teacher/invites")}>📩 Προσκλήσεις Επιτροπής</button>
        <button onClick={() => navigate("/assign-thema")}>📌 Ανάθεση Θέματος σε Φοιτητή</button>
        <button onClick={() => navigate("/ProfessorDiplomas")}>📄 Προβολή λίστας διπλωματικών</button>
        <button onClick={() => navigate("/TeacherStatistics")}>Προβολή στατιστικών</button>
      </div>
    </div>
  );
};

export default TeacherHome;

