const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getCollection(collectionName) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection(collectionName);
}

// LOGIN route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Έλεγχος στη συλλογή gramateia
    const gramateiaCol = await getCollection("gramateia");
    const secretary = await gramateiaCol.findOne({ username });

    if (secretary) {
      // Αν βρεθεί στη γραμματεία, ελέγχουμε τον κωδικό πρόσβασης
      if (secretary.password !== password) {
        return res.status(401).json({ message: "Λάθος κωδικός πρόσβασης" });
      }

      // Δημιουργία token για γραμματεία
      const token = jwt.sign(
        {
          username: secretary.username,
          role: "secretary"
        },
        "MY_SECRET_KEY",
        { expiresIn: "2h" }
      );

      return res.json({ token });
    }


    // Έλεγχος στη συλλογή Didaskontes
    const profCol = await getCollection("Didaskontes");
    const professor = await profCol.findOne({ username });

    if (professor) {
      if (professor.password !== password) {
        return res.status(401).json({ message: "Λάθος κωδικός πρόσβασης" });
      }

      // Δημιουργία token για διδασκων
      const token = jwt.sign(
        {
          username: professor.username,
          role: "teacher",
          id: professor.didaskonId,
        },
        "MY_SECRET_KEY",
        { expiresIn: "2h" }
      );

      return res.json({ token });
    }


    // Έλεγχος στη συλλογή students
    const studentsCol = await getCollection("students");
    const student = await studentsCol.findOne({ username });

    if (student) {
      // Αν βρεθεί στους φοιτητές, ελέγχουμε τον κωδικό πρόσβασης
      if (student.password !== password) {
        return res.status(401).json({ message: "Λάθος κωδικός πρόσβασης" });
      }

      // Δημιουργία token για φοιτητή
      const token = jwt.sign(
        {
          username: student.username,
          role: "student",
          am: student.arithmosMitroou
        },
        "MY_SECRET_KEY",
        { expiresIn: "2h" }
      );

      return res.json({ token });
    }

    // Αν δεν βρεθεί ο χρήστης σε καμία συλλογή
    return res.status(404).json({ message: "Ο χρήστης δεν βρέθηκε" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα κατά το login", error: err.message });
  }
});

module.exports = router;

