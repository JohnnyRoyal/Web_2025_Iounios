const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Route για αλλαγή κατάστασης σε "Περατωμένη"
router.post("/", authMiddleware, async (req, res) => {
  const { id } = req.body; // Λήψη του ID από το σώμα του αιτήματος

  try {
    console.log("User from Token:", req.user); // Εμφανίζει τα δεδομένα του χρήστη από το token

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

    // Εύρεση της διπλωματικής με βάση το ID
    const diploma = await collection.findOne({ _id: ObjectId(id) });

    if (!diploma) {
      return res.status(404).json({ message: `❌ Δεν βρέθηκε διπλωματική με ID: ${id}.` });
    }

    // Έλεγχος αν το πεδίο "link_Nemertes"  είναι συμπληρωμένο
    if (!diploma.syndesmos) {
      return res.status(400).json({
        message: "❌ Δεν υπάρχει link στον Νημέτρη, πρέπει να είναι συμπληρωμένο πριν την αλλαγή κατάστασης.",
        errorType: "NO_LINK_Nemertes" //error type για διαφοροποίηση του σφάλματος στο frontend
      });
    }

    // Έλεγχος αν το πεδίο "grade" είναι συμπληρωμένο
    if (!diploma.telikosVathmos) {
      return res.status(400).json({
        message: "❌ Πρέπει να έχει περαστεί βαθμός πριν την αλλαγή κατάστασης σε Περατωμένη .",
        errorType: "NO_FINAL_GRADE" //error type για διαφοροποίηση του σφάλματος στο frontend
      });
    }

    // Ενημέρωση της διπλωματικής με την κατάσταση "Περατωμένη" και προσθήκη στο array "proigoumenesKatastaseis"
    const result = await collection.updateOne(
      { _id: ObjectId(id), katastasi: "υπό εξέταση" }, // Εύρεση της διπλωματικής με βάση το ID και την κατάσταση
      {
        $set: {
          katastasi: "Περατωμένη", // Ενημέρωση της κατάστασης
        },
        $push: {
          proigoumenesKatastaseis: 3, // Προσθήκη του αριθμού 3 στο array για δήλωση της προηγούμενης κατάστασης
        },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        message: `❌ Δεν βρέθηκε διπλωματική με τίτλο: ${titlos}, είτε το ID είναι λάθος είτε η κατάσταση δεν είναι "υπό εξέταση".`,
      });
    } else {
      res.status(200).json({ message: `✅ Ενημερώθηκε η διπλωματική με τίτλο: ${titlos} σε "Περατωμένη" και προστέθηκε στο array "proigoumenesKatastaseis".` });
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
