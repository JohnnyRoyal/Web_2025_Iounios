const express = require("express");
const authRoutes = require("./routes/authRoutes");
const diplomaRoutes = require("./routes/diplomaRoutes");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/diplomas", diplomaRoutes); // περιέχει το protected /my

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
