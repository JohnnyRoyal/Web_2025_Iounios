const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Route για αλλαγή κατάστασης σε "υπό εξέταση"
router.post("/", authMiddleware, async (req, res) => {
  const { id } = req.body; // Λήψη του ID από το σώμα του αιτήματος

  try {
    console.log("User from Token:", req.user); // Εμφανίζει τα δεδομένα του χρήστη από το token
    console.log("Received request:", { id}); // Για debugging

    // Ελέγχουμε αν ο χρήστης έχει δικαιώματα (π.χ., είναι διδάσκων)
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Μόνο ο διδάσκων έχει πρόσβαση εδώ." });
    }

    // Σύνδεση στη βάση δεδομένων
    await client.connect();
    console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

    // Επιλογή βάσης δεδομένων και συλλογής
    const database = client.db("users");
    const collection = database.collection("Diplomatikes");

    //Φτιάνω το id της διπλωματικής από το string που έρχεται από το frontend που ταν το id
    // και το μετατρέπω σε ObjectId για να μπορέσω να το χρησιμοποιήσω στη MongoDB
    //κάτι buggare με τα  ObkectId και ήθελε το new ObjectId(id)
    let my_objectId;
    try {
      my_objectId = new ObjectId(id);
    } catch (err) {
      return res.status(400).json({ message: "❌ Μη έγκυρο ID διπλωματικής" });
    }

    // Εύρεση της διπλωματικής με βάση το ID
    const diploma = await collection.findOne({ _id: my_objectId });

    if (!diploma) {
      return res.status(404).json({ message: `❌ Δεν βρέθηκε διπλωματική με ID: ${id}.` });
    }

    // Έλεγχος αν ο χρήστης είναι ο κύριος καθηγητής της διπλωματικής (με βάση το didaskonId) το έχουμε στο token
    if (
    !diploma.mainKathigitis ||
    diploma.mainKathigitis.didaskonId !== req.user.id
    ) {
    return res.status(403).json({ message: "❌ Μόνο ο κύριος καθηγητής της διπλωματικής μπορεί να αλλάξει την κατάστασή της." });
    }

    // Ενημέρωση της διπλωματικής με την κατάσταση "Περατωμένη" και προσθήκη στο array "proigoumenesKatastaseis"
    const result = await collection.findOne(
        { _id: my_objectId, katastasi: "υπό εξέταση" }, // Εύρεση της διπλωματικής με βάση το ID και την κατάσταση
        { projection: { pdfProxeiroKeimeno: 1} } // Επιστρέφει μόνο το πεδίο pdfProxeiroKeimeno και το _id από προεπιλογή
    );

    if (!result) {
      res.status(404).json({
        message: `❌ Δεν βρέθηκε διπλωματική με id: ${id}, είτε το ID είναι λάθος είτε η κατάσταση δεν είναι "υπό εξέταση".`,
      });
    } else {
        res.status(200).json({
            pdfProxeiroKeimeno: result.pdfProxeiroKeimeno,
            id: result._id
        });
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