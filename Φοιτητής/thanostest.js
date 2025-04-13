
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Φόρτωση αρχικού JSON με φοιτητές
const rawStudents = JSON.parse(fs.readFileSync("students.json", "utf8"));

// Μετατροπή στο επιθυμητό format
const formattedStudents = rawStudents.map(s => ({
  am: s.student_number,
  fullName: `${s.name} ${s.surname}`,
  email: s.email,
  address: `${s.street} ${s.number}, ${s.city}, ${s.postcode}`,
  mobilePhone: s.mobile_telephone,
  landlinePhone: s.landline_telephone
}));

async function eisagwgh_dedomenwn() {
  try {
    await client.connect();
    console.log("✅ Συνδέθηκε στη MongoDB");

    const db = client.db("users");
    const studentsCollection = db.collection("students");

    // Μπορείς να καθαρίσεις τη συλλογή αν θες
    // await studentsCollection.deleteMany({});

    const result = await studentsCollection.insertMany(formattedStudents);
    console.log(`✅ Εισήχθησαν ${result.insertedCount} φοιτητές.`);
  } catch (err) {
    console.error("❌ Σφάλμα:", err);
  } finally {
    await client.close();
    console.log("🔌 Σύνδεση έκλεισε");
  }
}

eisagwgh_dedomenwn();



const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");


// Middleware για MongoDB σύνδεση
async function getDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("students");
}

// 🔍 GET προφίλ φοιτητή
router.get("/:am", async (req, res) => {
  try {
    const students = await getDB();
    const student = await students.findOne({ am: req.params.am });

    if (!student) {
      return res.status(404).json({ message: "Ο φοιτητής δεν βρέθηκε" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

// ✏️ PUT ενημέρωση προφίλ φοιτητή
router.put("/:am", async (req, res) => {
  const { address, email, mobilePhone, landlinePhone } = req.body;

  try {
    const students = await getDB();
    const result = await students.findOneAndUpdate(
      { am: req.params.am },
      {
        $set: {
          address,
          email,
          mobilePhone,
          landlinePhone
        }
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "Ο φοιτητής δεν βρέθηκε για ενημέρωση" });
    }

    res.json({
      message: "Το προφίλ ενημερώθηκε επιτυχώς",
      student: result.value
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

module.exports = router;
