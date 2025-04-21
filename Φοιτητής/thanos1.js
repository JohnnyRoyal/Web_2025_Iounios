// routes/diplomaRoutes.js
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

// Ο φοιτητής βλέπει το θέμα του ΜΟΝΟ αν είναι συνδεδεμένος
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Μόνο φοιτητές έχουν πρόσβαση εδώ." });
    }

    const diplomas = await getDiplomasCollection();
    const diploma = await diplomas.findOne({ "foititis.student_number": req.user.am });

    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική για αυτόν τον φοιτητή." });
    }

    const {
      titlos,
      perigrafi,
      pdfExtraPerigrafi,
      katastasi,
      trimeriEpitropi,
      imerominiaAnathesis
    } = diploma;

    let timeSinceAssignment = null;
    if (imerominiaAnathesis) {
      const now = new Date();
      const assigned = new Date(imerominiaAnathesis);
      const diffDays = Math.floor(Math.abs(now - assigned) / (1000 * 60 * 60 * 24));
      timeSinceAssignment = `${diffDays} μέρες`;
    }

    res.json({
      title: titlos,
      summary: perigrafi,
      pdf_url: pdfExtraPerigrafi,
      status: katastasi,
      committee: trimeriEpitropi,
      assignment_date: imerominiaAnathesis,
      time_since_assignment: timeSinceAssignment
    });

  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

module.exports = router;
