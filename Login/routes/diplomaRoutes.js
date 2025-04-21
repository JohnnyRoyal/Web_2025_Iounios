//Λύση  Φοιτητή ερωτήματος 1) Προβολή θέματος
const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("Diplomatikes");
}

// GET /api/diplomas/my - προβολή διπλωματικής από login φοιτητή
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Απαγορεύεται η πρόσβαση" });
    }

    const diplomas = await getCollection();
    const diploma = await diplomas.findOne({
      "foititis.arithmosMitroou": parseInt(req.user.am) // από το JWT
    });

    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική εργασία" });
    }

    // Ανάκτηση και επεξεργασία χρόνου
    let timeSinceAssignment = null;
    if (diploma.imerominiaAnathesis) {
      const now = new Date();
      const start = new Date(diploma.imerominiaAnathesis);
      const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      timeSinceAssignment = `${days} μέρες`;
    }

    res.json({
      title: diploma.titlos,
      summary: diploma.perigrafi,
      pdf_url: diploma.pdfExtraPerigrafi,
      status: diploma.katastasi,
      committee: diploma.trimeriEpitropi,
      assignment_date: diploma.imerominiaAnathesis,
      time_since_assignment: timeSinceAssignment
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

module.exports = router;
