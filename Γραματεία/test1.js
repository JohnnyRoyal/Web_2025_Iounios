const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "users";

let db, xristes;

async function connectDB() {
  await client.connect();
  db = client.db(dbName);
  xristes = db.collection("xristes");
  console.log("✅ MongoDB σύνδεση ενεργή");
}
connectDB();

// --- API για λήψη όλων των χρηστών
app.get("/api/users", async (req, res) => {
  try {
    const allUsers = await xristes.find().toArray();
    res.json(allUsers);
  } catch (err) {
    console.error("❌ Σφάλμα:", err);
    res.status(500).send("Σφάλμα διακομιστή");
  }
});

// --- API για εισαγωγή χρηστών (π.χ. από τη Γραμματεία)
app.post("/api/users/import", async (req, res) => {
  try {
    const newUsers = req.body; // Πρέπει να είναι array
    if (!Array.isArray(newUsers)) {
      return res.status(400).json({ error: "Πρέπει να παρέχετε array από χρήστες." });
    }

    // Π.χ. ορίζουμε role με βάση email ή type
    const usersWithDefaults = newUsers.map(u => ({
      ...u,
      password: Math.random().toString(36).slice(-8), // τυχαίο password
      username: u.email,
      role: u.role || "student", // default αν δεν υπάρχει
    }));

    const result = await xristes.insertMany(usersWithDefaults);
    res.json({ insertedCount: result.insertedCount });
  } catch (err) {
    console.error("❌ Σφάλμα κατά την εισαγωγή:", err);
    res.status(500).send("Αποτυχία εισαγωγής");
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
