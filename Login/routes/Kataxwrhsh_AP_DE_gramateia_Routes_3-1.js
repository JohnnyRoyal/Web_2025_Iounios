const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Route για την καταχώρηση του ΑΠ
router.post("/", authMiddleware, async (req, res) => {
  const { id, protocolNumber } = req.body; // Λήψη δεδομένων από το σώμα του αιτήματος

  try {
    console.log("User from Token:", req.user); // Εμφανίζει τα δεδομένα του χρήστη από το token
    console.log("Received request:", { id, protocolNumber }); // Για debugging

    // Ελέγχουμε αν ο χρήστης έχει δικαιώματα (π.χ., είναι γραμματεία)
    if (req.user.role !== "secretary") {
      return res.status(403).json({ message: "Μόνο η γραμματεία έχει πρόσβαση εδώ." });
    }

    // Σύνδεση στη βάση δεδομένων
    await client.connect();
    console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

    // Επιλογή βάσης δεδομένων και συλλογής
    const database = client.db("users");
    const collection = database.collection("Diplomatikes");

    // Έλεγχος αν υπάρχει ήδη ΑΠ στη διπλωματική
    const existingDiploma = await collection.findOne({ _id: new ObjectId(id) });
    
    if (existingDiploma && existingDiploma.AP) {
      return res.status(400).json({ 
        message: `❌ Η διπλωματική έχει ήδη καταχωρημένο ΑΠ: ${existingDiploma.AP}`,
        errorType: "AP_ALREADY_EXISTS"
      });
    }

    // Ενημέρωση της διπλωματικής με το νέο ΑΠ
    const result = await collection.updateOne(
      { _id: new ObjectId(id), katastasi: "Ενεργή" }, // Εύρεση των ενεργών διπλωματικών με βάση το ID
      {
        $set: {
          AP: protocolNumber,
        },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: `❌ Δεν βρέθηκε διπλωματική με ID: ${id}, είτε το ID είναι λάθος είτε η διπλωματική δεν είναι ενεργή.` });
    } else {
      res.status(200).json({ message: `✅ Ενημερώθηκε η διπλωματική με ID: ${id}` });
    }
  } catch (error) {
    console.error("❌ Σφάλμα κατά την ενημέρωση:", error);
    res.status(500).json({ message: "❌ Σφάλμα κατά την ενημέρωση." });
  } finally {
    // Κλείσιμο σύνδεσης
    await client.close();
    console.log("🔌 Σύνδεση στη MongoDB έκλεισε.");
  }
});

module.exports = router;