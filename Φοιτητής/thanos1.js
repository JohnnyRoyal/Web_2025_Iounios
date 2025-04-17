const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getDiplomasCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("diplomas");
}

router.get("/:am", async (req, res) => {
  try {
    const diplomas = await getDiplomasCollection();
    const diploma = await diplomas.findOne({ student_am: req.params.am });

    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε ανάθεση για τον φοιτητή" });
    }

    let timeSinceAssignment = null;
    if (diploma.assignment_date) {
      const now = new Date();
      const assigned = new Date(diploma.assignment_date);
      const diffDays = Math.floor(Math.abs(now - assigned) / (1000 * 60 * 60 * 24));
      timeSinceAssignment = `${diffDays} ημέρες`;
    }

    res.json({
      title: diploma.title,
      summary: diploma.summary,
      pdf_url: diploma.pdf_url,
      status: diploma.status,
      committee: diploma.committee,
      assignment_date: diploma.assignment_date,
      time_since_assignment: timeSinceAssignment
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

module.exports = router;
