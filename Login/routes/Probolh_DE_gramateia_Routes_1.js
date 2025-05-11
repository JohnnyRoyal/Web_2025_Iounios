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

// Υπολογισμός χρόνου από την ανάθεση
function calculateTimeSinceSubmission(imerominiaAnathesis) {
  if (!imerominiaAnathesis) return "Δεν υπάρχει ημερομηνία ανάθεσης.";
  const currentDate = new Date();
  const submissionDate = new Date(imerominiaAnathesis);
  const timeDifference = currentDate - submissionDate; // Διαφορά σε milliseconds
  const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Μετατροπή σε ημέρες
  return `${daysPassed} ημέρες`;
}

// Route για επιστροφή διπλωματικών με επιλεγμένα πεδία
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("User from Token:", req.user); // Εμφανίζει τα δεδομένα του χρήστη από το token
    // Ελέγχουμε αν ο χρήστης είναι γραμματεία
    if (req.user.role !== "secretary") {
      return res.status(403).json({ message: "Μόνο η γραμματεία έχει πρόσβαση εδώ." });
    }

    const diplomas = await getDiplomasCollection();
    const diplomatikesData = await diplomas.find({
      $or: [
        { katastasi: "Ενεργή" },
        //{ katastasi: "υπό ανάθεση" }  //προσςρινό για debugging
        { katastasi: "υπό εξέταση" } 
      ]
    }).toArray();

    // Φιλτράρουμε τα δεδομένα για να επιστρέψουμε μόνο τα απαραίτητα πεδία
    const filteredData = diplomatikesData.map((doc) => ({
      _id: doc._id.toString(), // Προσθήκη του _id ως string για χρήση στο frontend
      titlos: doc.titlos,
      perigrafi: doc.perigrafi,
      katastasi: doc.katastasi,
      pdf_extra_perigrafh: doc.pdfExtraPerigrafi,
      trimerisEpitropi: doc.trimeriEpitropi?.map((member) => ({
        onoma: member.onoma,
        epitheto: member.epitheto,
        vathmos: member.vathmos || null, // Προαιρετικά, αν θέλεις να συμπεριλάβεις τον βαθμό
      })) || [],
      xronosApoAnathesi: calculateTimeSinceSubmission(doc.imerominiaAnathesis)
    }));
    console.log("📌 Δεδομένα Διπλωματικών:", filteredData); // Εμφάνιση φιλτραρισμένων δεδομένων στο console για καλητερούλη DeBug

    res.json(filteredData); // Επιστροφή φιλτραρισμένων δεδομένων σε JSON μορφή
  } catch (error) {
    console.error("❌ Σφάλμα σύνδεσης:", error);
    res.status(500).send("Σφάλμα κατά την ανάκτηση δεδομένων.");
  }
});

module.exports = router;