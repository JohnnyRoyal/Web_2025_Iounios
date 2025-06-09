// TeacherStatistics.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2"; // import charts που θες
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const TeacherStatistics = () => {
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:4000/api/teacher/statistics", {
      headers: { Authorization: token }
    })
    .then(res => setStats(res.data))
    .catch(() => setMsg("❌ Σφάλμα φόρτωσης στατιστικών."));
  }, [token]);

  if (msg) return <p style={{ color: "red" }}>{msg}</p>;
  if (!stats) return <p>⏳ Φόρτωση...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Στατιστικά Διπλωματικών</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <div style={{ width: 300 }}>
          <Bar data={{
            labels: ["Μέσος Χρόνος (μέρες)"],
            datasets: [{ label: "Μέσος Χρόνος", data: [stats.avgDays], backgroundColor: "#36a2eb" }]
          }} />
        </div>

        <div style={{ width: 300 }}>
          <Bar data={{
            labels: ["Μέσος Βαθμός"],
            datasets: [{ label: "Μέσος Βαθμός", data: [stats.avgGrade], backgroundColor: "#ff6384" }]
          }} />
        </div>

        <div style={{ width: 300 }}>
          <Pie data={{
            labels: ["Συνολικό Πλήθος διπλωματικών"],
            datasets: [{ data: [stats.count], backgroundColor: ["#4caf50"] }]
          }} />
        </div>
      </div>
    </div>
  );
};

export default TeacherStatistics;
