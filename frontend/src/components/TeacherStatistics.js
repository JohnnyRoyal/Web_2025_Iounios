// TeacherStatistics.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

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

      <div style={{ display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "center" }}>

        {/* 1. Πλήθος διπλωματικών */}
        <div style={{ width: 300 }}>
          <Pie data={{
            labels: ["Ως Επιβλέπων", "Ως Μέλος Τριμελούς"],
            datasets: [{
              data: [stats.main.count, stats.member.count],
              backgroundColor: ["#36a2eb", "#ff9f40"]
            }]
          }} />
          <p style={{ textAlign: "center" }}>Σύνολο Διπλωματικών</p>
        </div>

        {/* 2. Μέσος Χρόνος Περάτωσης */}
        <div style={{ width: 300 }}>
          <Bar data={{
            labels: ["Ως Επιβλέπων", "Ως Μέλος Τριμελούς"],
            datasets: [{
              label: "Μέσες Ημέρες",
              data: [stats.main.avgDays, stats.member.avgDays],
              backgroundColor: ["#4caf50", "#81c784"]
            }]
          }} />
          <p style={{ textAlign: "center" }}>Μέσος Χρόνος Περάτωσης</p>
        </div>

        {/* 3. Μέσος Βαθμός */}
        <div style={{ width: 300 }}>
          <Bar data={{
            labels: ["Ως Επιβλέπων", "Ως Μέλος Τριμελούς"],
            datasets: [{
              label: "Μέσος Βαθμός",
              data: [parseFloat(stats.main.avgGrade), parseFloat(stats.member.avgGrade)],
              backgroundColor: ["#ff6384", "#ffcd56"]
            }]
          }} />
          <p style={{ textAlign: "center" }}>Μέσος Τελικός Βαθμός</p>
        </div>

      </div>
    </div>
  );
};

export default TeacherStatistics;
