const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Route για αλλαγή κατάστασης σε "Περατωμένη"
router.post("/complete", authMiddleware, async (req, res) => {
  const { id, grade, link_Nemertes } = req.body; // Λήψη δεδομένων από το σώμα του αιτήματος

  try {
    console.log("User from Token:", req.user); // Εμφανίζει τα δεδομένα του χρήστη από το token

    // Ελέγχουμε αν ο χρήστης έχει δικαιώματα (π.χ., είναι γραμματεία)
    if (req.user.role !== "secretary") {
      return res.status(403).json({ message: "Μόνο η γραμματεία έχει πρόσβαση εδώ." });
    }

    // Έλεγχος αν τα απαραίτητα πεδία δεν είναι null
    if (!grade || !link_Nemertes) {
      return res.status(400).json({ message: "❌ Ο βαθμός και ο σύνδεσμος προς το Νημερτή είναι υποχρεωτικά πεδία." });
    }

    // Σύνδεση στη βάση δεδομένων
    await client.connect();
    console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

    // Επιλογή βάσης δεδομένων και συλλογής
    const database = client.db("users");
    const collection = database.collection("diplomatikes");

    // Ενημέρωση της διπλωματικής με την κατάσταση "Περατωμένη"
    const result = await collection.updateOne(
      { _id: ObjectId(id), katastasi: "υπό εξέταση" }, // Εύρεση της διπλωματικής με βάση το ID και την κατάσταση
      {
        $set: {
          katastasi: "Περατωμένη",
          grade: grade,
          link_Nemertes: link_Nemertes,
        },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: `❌ Δεν βρέθηκε διπλωματική με ID: ${id}, είτε το ID είναι λάθος είτε η κατάσταση δεν είναι "υπό εξέταση".` });
    } else {
      res.status(200).json({ message: `✅ Ενημερώθηκε η διπλωματική με ID: ${id} σε "Περατωμένη".` });
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
