const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Route για ακύρωση ανάθεσης θέματος
router.post("/", authMiddleware, async (req, res) => {
  const { id, logosAkyrosis, imerominiaGenikisSyneleysis, arithmosGenikhsSynelefsisAkyrwshs} = req.body; // Λήψη δεδομένων από το σώμα του αιτήματος

  try {
    console.log("User from Token:", req.user); // Εμφανίζει τα δεδομένα του χρήστη από το token
    console.log("Received request:", { id,logosAkyrosis,imerominiaGenikisSyneleysis,arithmosGenikhsSynelefsisAkyrwshs}); // Για debugging

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
    
    // Έλεγχος αν η διπλωματική υπάρχει, ψιλοαχρείαστο γιατί το ελέγχω παρακάτω και στο updateOne αλλά και καλά εδώ γλειτώνεις και ένα updateOne πριν το προσπαθήσει
    if (!diploma) {
      return res.status(404).json({ message: `❌ Δεν βρέθηκε διπλωματική με ID: ${id}.` });
    }

    // Μετατροπή της ημερομηνίας σε μορφή ISODate
    const isoDate = new Date(imerominiaGenikisSyneleysis);

    // Ενημέρωση της διπλωματικής με τα δεδομένα ακύρωσης
    const result = await collection.updateOne(
      { _id: my_objectId }, // Εύρεση της διπλωματικής με βάση το ID
      {
        $set: {
          katastasi: "υπό ανάθεση", // Ενημέρωση της κατάστασης
          logosAkyrosis:  logosAkyrosis,    // Καταχώρηση του λόγου ακύρωσης
          imerominiaAkyrosis: isoDate,  // Καταχώρηση της ημερομηνίας της Γενικής Συνέλευσης
          arithmosGenikhsSynelefsisAkyrwshs: arithmosGenikhsSynelefsisAkyrwshs,  // Καταχώρηση του αριθμού της Γενικής Συνέλευσης
        },
        $push: {
          proigoumenesKatastaseis: 0, // Ενημέρωση του array  με την κατάσταση "υπό ανάθεση"
        },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        message: `❌ Δεν βρέθηκε διπλωματική με id: ${id}.`,
      });
    } else {
      res.status(200).json({ message: `✅ Η ανάθεση της διπλωματική με id: ${id} ακυρώθηκε επιτυχώς.` });
    }
  } catch (error) {
    console.error("❌ Σφάλμα κατά την ακύρωση ανάθεσης:", error);
    res.status(500).json({ message: "❌ Σφάλμα κατά την ακύρωση ανάθεσης." });
  } finally {
    // Κλείσιμο σύνδεσης
    await client.close();
    console.log("🔌 Σύνδεση στη MongoDB έκλεισε.");
  }
});

module.exports = router;