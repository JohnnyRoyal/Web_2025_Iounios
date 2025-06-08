import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProfileEditor.css"; // Προσθήκη CSS για στυλ

const ProfileEditor = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/students/me", {
          headers: { Authorization: token }
        });
        setProfile(res.data);
      } catch (err) {
        setError("Αποτυχία φόρτωσης προφίλ");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:4000/api/students/me", profile, {
        headers: { Authorization: token }
      });
      setSuccess("Το προφίλ ενημερώθηκε επιτυχώς.");
    } catch (err) {
      setError("Αποτυχία αποθήκευσης");
    }
  };

  if (!profile) return <p>Φόρτωση...</p>;

  return (
    <div className="profile-container">
      <h2>🧾 Επεξεργασία Προφίλ</h2>
      <label>Διεύθυνση:</label>
      <input name="taxydromikiDieythinsi" value={profile.taxydromikiDieythinsi || ""} onChange={handleChange} />
      <label>Email:</label>
      <input name="email" value={profile.email || ""} onChange={handleChange} />
      <label>Κινητό:</label>
      <input name="kinito" value={profile.kinito || ""} onChange={handleChange} />
      <label>Σταθερό:</label>
      <input name="stathero" value={profile.stathero || ""} onChange={handleChange} />
      <button onClick={handleSave}>💾 Αποθήκευση</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default ProfileEditor;