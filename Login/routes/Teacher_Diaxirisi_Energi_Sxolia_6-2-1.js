const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Προσθήκη σχολίου σε διπλωματική
router.post("/", authMiddleware, async (req, res) => {
  const { id, keimeno } = req.body; // id = id διπλωματικής, keimeno = σχόλιο

  // Έλεγχος μήκους σχολίου
  if (!keimeno || keimeno.length === 0 || keimeno.length > 300) {
    return res.status(400).json({ message: "Το σχόλιο πρέπει να είναι 1-300 χαρακτήρες." });
  }

  try {
    await client.connect();
    const database = client.db("users");
    const collection = database.collection("Diplomatikes");

    // Ελέγχουμε αν ο χρήστης έχει δικαιώματα (π.χ., είναι διδάσκων)
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Μόνο ο διδάσκων έχει πρόσβαση εδώ." });
    }

    // Δημιουργία αντικειμένου σχολίου
    const sxolio = {
      didaskonId: req.user.id, // από το token
      username: req.user.username, // από το token
      keimeno,
      createdAt: new Date()
    };

    // Push το σχόλιο στο array sxolia
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { sxolia: sxolio } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική." });
    }

    // Βρες τα σχόλια του συγκεκριμένου διδάσκοντα για αυτή τη διπλωματική
    const diploma = await collection.findOne({ _id: new ObjectId(id) }, { projection: { sxolia: 1 } });
    const myComments = (diploma.sxolia || []).filter(s => s.didaskonId === req.user.id);


    res.status(200).json({ message: "✅ Το σχόλιο προστέθηκε επιτυχώς.",myComments });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα κατά την προσθήκη σχολίου." });
  } finally {
    await client.close();
  }
});



//Το extra route για την προβολή των σχολίων του διδάσκοντα
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await client.connect();
    const database = client.db("users");
    const collection = database.collection("Diplomatikes");

    // Βρες τη διπλωματική και φέρε μόνο τα σχόλια του συγκεκριμένου καθηγητή
    const diploma = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { sxolia: 1 } }
    );
    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική." });
    }
    // Φιλτράρω τα σχόλια για να κρατήσω μόνο αυτά του συγκεκριμένου διδάσκοντα που είναι στο token το req.user.id
    const myComments = (diploma.sxolia || []).filter(
      s => s.didaskonId === req.user.id
    );
    res.json({ myComments });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση σχολίων." });
  } finally {
    await client.close();
  }
});

module.exports = router;