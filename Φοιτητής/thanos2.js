
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



// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");


async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db("users");
  return db.collection("xristes");
}

// ✅ GET φοιτητή με βάση τον student_number (am)
router.get("/:am", async (req, res) => {
  try {
    const collection = await getCollection();

    const doc = await collection.findOne({ "students.student_number": req.params.am });

    if (!doc) return res.status(404).json({ message: "Ο φοιτητής δεν βρέθηκε" });

    const student = doc.students.find(s => s.student_number === req.params.am);

    if (!student) return res.status(404).json({ message: "Ο φοιτητής δεν βρέθηκε" });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα", error: err.message });
  }
});

// ✅ PUT ενημέρωση στοιχείων φοιτητή
router.put("/:am", async (req, res) => {
  const { address, email, mobilePhone, landlinePhone } = req.body;

  try {
    const collection = await getCollection();

    // Εντοπίζουμε τον φοιτητή μέσα στο students array
    const result = await collection.updateOne(
      { "students.student_number": req.params.am },
      {
        $set: {
          "students.$.email": email,
          "students.$.street": address?.split(",")[0]?.trim() || "",
          "students.$.number": address?.split(",")[0]?.match(/\d+/)?.[0] || "",
          "students.$.city": address?.split(",")[1]?.trim() || "",
          "students.$.postcode": address?.split(",")[2]?.trim() || "",
          "students.$.mobile_telephone": mobilePhone,
          "students.$.landline_telephone": landlinePhone
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Ο φοιτητής δεν βρέθηκε ή δεν ενημερώθηκε" });
    }

    res.json({ message: "Επιτυχής ενημέρωση" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα ενημέρωσης", error: err.message });
  }
});

module.exports = router;

