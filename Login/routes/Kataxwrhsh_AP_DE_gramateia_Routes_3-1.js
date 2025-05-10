const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Route για την καταχώρηση του ΑΠ
router.post("/", authMiddleware, async (req, res) => {
  const { id, protocolNumber } = req.body;

  try {
    // Debugging
    console.log('Received request:', {
      id: id,
      protocolNumber: protocolNumber
    });

    if (!id || !protocolNumber) {
      return res.status(400).json({ 
        message: "❌ Απαιτούνται τόσο το ID όσο και ο αριθμός πρωτοκόλλου" 
      });
    }

    // Έλεγχος εγκυρότητας του ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: "❌ Μη έγκυρο ID διπλωματικής" 
      });
    }

    await client.connect();
    console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

    const database = client.db("users");
    const collection = database.collection("Diplomatikes");

    const result = await collection.updateOne(
      { _id: new ObjectId(id), katastasi: "Ενεργή" },
      {
        $set: {
          AP: protocolNumber,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        message: "❌ Δεν βρέθηκε ενεργή διπλωματική με το συγκεκριμένο ID" 
      });
    }

    res.status(200).json({ 
      message: "✅ Ο αριθμός πρωτοκόλλου καταχωρήθηκε επιτυχώς!" 
    });

  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ 
      message: "❌ Σφάλμα κατά την ενημέρωση της διπλωματικής" 
    });
  } finally {
    await client.close();
  }
});

module.exports = router;