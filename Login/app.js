const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const diplomaRoutes = require("./routes/diplomaRoutes");
const studentRoutes = require("./routes/studentRoutes");
const secretaryRoutes = require("./routes/Probolh_DE_gramateia_Routes_1"); // Νέο route για τη γραμματεία για προβολή διπλωματικών
const eisagwghDedomenwnRoutes = require("./routes/Eisagwgh_Dedomwnwn_DE_gramateia_Routes_2.js"); // Νέο route για εισαγωγή δεδομένων φοιτητών και καθηγητών
const kataxwrhshAPRoutes = require("./routes/Kataxwrhsh_AP_DE_gramateia_Routes_3-1"); // Νέο route για την καταχώρηση του ΑΠ
const peratwshRoutes = require("./routes/Peratwsh_DE_gramateia_Routes_3-3"); // Νέο route για την ολοκλήρωση της διπλωματικής
const akyrwshAnatheshsRoutes = require("./routes/Akyrwsh_Anatheshs_Gramateia_DE_3-2"); // Νέο route για την ακύρωση ανάθεσης θέματος
const nologinviewRoutes = require("./routes/No_Login_View"); // Νέο route για την προβολή διπλωματικών χωρίς login


const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/diplomas", diplomaRoutes); // περιέχει το protected /my
app.use("/api/students", studentRoutes);
app.use("/api/secretary/diplomas", secretaryRoutes); // Προσθήκη route για τη γραμματεία για προβολή διπλωματικών
app.use("/api/secretary/eisagwgh", eisagwghDedomenwnRoutes); // Προσθήκη route για εισαγωγή δεδομένων φοιτητών και καθηγητών
app.use("/api/secretary/set-ap", kataxwrhshAPRoutes);   // Προσθήκη route για την καταχώρηση του ΑΠ
app.use("/api/secretary/complete", peratwshRoutes); // Προσθήκη route για την ολοκλήρωση της διπλωματικής
app.use("/api/secretary/cancel", akyrwshAnatheshsRoutes); // Προσθήκη route για την ακύρωση ανάθεσης θέματος
app.use("/api/diplomas/nologin", nologinviewRoutes); // Προσθήκη route για την προβολή διπλωματικών χωρίς login

app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
