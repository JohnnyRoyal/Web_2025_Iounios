const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getDiplomasCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("Diplomatikes");
}

// Route για επιστροφή διπλωματικών με κατάσταση "Ενεργή" ή "Υπό Ανάθεση"
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Ελέγχουμε αν ο χρήστης είναι γραμματεία
    if (req.user.role !== "secretary") {
      return res.status(403).json({ message: "Δεν έχετε δικαίωμα πρόσβασης." });
    }

    const diplomas = await getDiplomasCollection();
    const diplomatikesData = await diplomas.find({
      $or: [
        { katastasi: "Ενεργή" },
        { katastasi: "Υπό Ανάθεση" }
      ]
    }).toArray();

    res.json(diplomatikesData); // Επιστροφή δεδομένων σε JSON μορφή
  } catch (error) {
    console.error("❌ Σφάλμα σύνδεσης:", error);
    res.status(500).send("Σφάλμα κατά την ανάκτηση δεδομένων.");
  }
});

module.exports = router;