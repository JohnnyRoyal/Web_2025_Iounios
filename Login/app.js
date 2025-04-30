const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const diplomaRoutes = require("./routes/diplomaRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/diplomas", diplomaRoutes); // περιέχει το protected /my
app.use("/api/students", studentRoutes);


app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
