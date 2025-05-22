import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import "./StudentHome.css";


const StudentHome = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);


   useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:4000/api/students/me", {
          headers: { Authorization: token }
        });
        setStudent(res.data); // π.χ. { onoma: 'Άννα', epitheto: 'Καραμήτρου', am: 20241001 }
      } catch (err) {
        console.error("Σφάλμα ανάκτησης στοιχείων φοιτητή");
      }
    };
      

    fetchStudent();
    }, []);


  const handleLogout = () => {
    localStorage.removeItem("token"); //καθαρισε token
    navigate("/"); //γυρνα login page
  };

  return (
    <div className="student-home-container">
      <div className="logoutContainer">
        <button onClick={handleLogout} className="logoutButton">🚪 Αποσύνδεση</button>
      </div>

      <h2>Καλωσήρθατε, {student?.onoma} {student?.epitheto}!</h2>
      <p className="am-label">Αριθμός Μητρώου: {student?.arithmosMitroou}</p>

      <div className="student-menu">
        <button onClick={() => navigate("/thesis")}>📄 Προβολή Θέματος</button>
        <button onClick={() => navigate("/profile")}>🧾 Επεξεργασία Προφίλ</button>
        <button onClick={() => navigate("/diploma")}>🛠 Διαχείριση Διπλωματικής</button>
      </div>
    </div>
  );
};


export default StudentHome;

