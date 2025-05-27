// routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// DB setup
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getDiplomaCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("Diplomatikes");
}

async function getStudentCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("students");
}

// Multer setup (μόνο για PDF)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Μόνο PDF αρχεία επιτρέπονται!"), false);
  }
});

// GET /api/teacher/themata - Προβολή θεμάτων διδάσκοντα
router.get("/themata", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
    }

    const diplomas = await getDiplomaCollection();

    const themata = await diplomas.find({
      "mainKathigitis.didaskonId": req.user.id,
      katastasi: "διαθέσιμη προς ανάθεση"
    }).toArray();

    res.json(themata);
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

// POST /api/teacher/themata - Δημιουργία νέου θέματος
router.post("/themata", authMiddleware, upload.single("pdfPerigrafis"), async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
    }

    const { titlos, perigrafi } = req.body;
    if (!titlos || !perigrafi) {
      return res.status(400).json({ message: "Ο τίτλος και η περιγραφή είναι υποχρεωτικά πεδία" });
    }

    const collection = await getDiplomaCollection();
    const professorsCol = client.db("users").collection("Didaskontes");
    const professor = await professorsCol.findOne({ didaskonId: req.user.id });

        if (!professor) {
          return res.status(404).json({ message: "Δεν βρέθηκαν στοιχεία διδάσκοντα." });
        }

    const newDiploma = {
      titlos,
      perigrafi,
      mainKathigitis: {
        onoma: professor.onoma,
        epitheto: professor.epitheto,
        didaskonId: req.user.id
      },
      trimelisEpitropi: [{
        onoma: professor.onoma,
        epitheto: professor.epitheto,
        didaskonId: req.user.id,
        vathmos: null
      }],
      dateCreated: new Date(),
      katastasi: "διαθέσιμη προς ανάθεση"
    };

    if (req.file) {
      newDiploma.pdfPath = req.file.path;
      newDiploma.pdfPerigrafi = req.file.filename;
    }

    const result = await collection.insertOne(newDiploma);

    res.status(201).json({
      message: "Το θέμα δημιουργήθηκε επιτυχώς",
      themaId: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

// PUT /api/teacher/themata/:id - Επεξεργασία υπάρχοντος θέματος
router.put("/themata/:id", authMiddleware, upload.single("pdfPerigrafis"), async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
    }

    const { titlos, perigrafi } = req.body;
    const themaId = req.params.id;

    if (!titlos || !perigrafi) {
      return res.status(400).json({ message: "Ο τίτλος και η περιγραφή είναι υποχρεωτικά" });
    }

    const collection = await getDiplomaCollection();

    const existing = await collection.findOne({
      _id: new ObjectId(themaId),
      "mainKathigitis.didaskonId": req.user.id,
      katastasi: "διαθέσιμη προς ανάθεση"
    });

    if (!existing) {
      return res.status(404).json({ message: "Το θέμα δεν βρέθηκε ή δεν σας ανήκει" });
    }

    const updateDoc = {
      $set: {
        titlos,
        perigrafi,
        dateUpdated: new Date()
      }
    };

    if (req.file) {
      if (existing.pdfPath) {
        fs.unlink(existing.pdfPath, err => {
          if (err) console.warn("⚠️ Σφάλμα διαγραφής PDF:", err.message);
        });
      }
      updateDoc.$set.pdfPath = req.file.path;
      updateDoc.$set.pdfPerigrafi = req.file.filename;
    }

    const result = await collection.updateOne({ _id: new ObjectId(themaId) }, updateDoc);
    res.json({ message: "Το θέμα ενημερώθηκε", modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα ενημέρωσης", error: err.message });
  }
});

//προβολή προσκλήσεων
router.get("/proskliseis", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
    }

    const professorsCol = client.db("users").collection("Didaskontes");
    const professor = await professorsCol.findOne({ didaskonId: req.user.id });

    if (!professor) {
      return res.status(404).json({ message: "Ο διδάσκων δεν βρέθηκε" });
    }

    // Επιστρέφουμε μόνο όσες προσκλήσεις δεν έχουν ακόμα απαντηθεί
    const activeInvites = (professor.proskliseis || []).filter(p =>
      !p.imerominiaApodoxis && !p.imerominiaAporripsis
    );

    res.json(activeInvites);
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα προβολής προσκλήσεων", error: err.message });
  }
});


// αποδοχή πρόσκλησης
router.put("/proskliseis/apodoxi/:index", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") return res.status(403).json({ message: "Μη εξουσιοδοτημένο" });

    const idx = parseInt(req.params.index);
    const professorsCol = client.db("users").collection("Didaskontes");
    const diplomasCol = client.db("users").collection("Diplomatikes");

    // Ενημέρωση βάσης Διδασκόντων
    const professorUpdate = await professorsCol.updateOne(
      {
        didaskonId: req.user.id,
        [`proskliseis.${idx}.imerominiaApodoxis`]: null,
        [`proskliseis.${idx}.imerominiaAporripsis`]: null
      },
      {
        $set: { [`proskliseis.${idx}.imerominiaApodoxis`]: new Date() }
      }
    );

    if (professorUpdate.modifiedCount === 0) {
      return res.status(400).json({ message: "Η πρόσκληση δεν ενημερώθηκε (πιθανόν έχει ήδη απαντηθεί)" });
    }

    // Βρες όλες τις διπλωματικές που περιέχουν αυτόν τον καθηγητή σε προσκλήσεις
    const diploma = await diplomasCol.findOne({
      "proskliseis.didaskonId": req.user.id,
      "proskliseis.apodoxi": null
    });

    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε σχετική διπλωματική" });
    }

    // Ενημέρωση πρόσκλησης μέσα στη διπλωματική
    await diplomasCol.updateOne(
      { _id: diploma._id, "proskliseis.didaskonId": req.user.id },
      { $set: { "proskliseis.$.apodoxi": true } }
    );

    // Πόσες προσκλήσεις έχουν αποδεχτεί;
    const updatedDiploma = await diplomasCol.findOne({ _id: diploma._id });
    const accepted = updatedDiploma.proskliseis.filter(p => p.apodoxi === true);

    if (accepted.length >= 2) {
      // Ορισμός κατάστασης σε "ενεργή" και εκκαθάριση άλλων προσκλήσεων
      await diplomasCol.updateOne(
        { _id: diploma._id },
        {
          $set: { katastasi: "ενεργή" },
          $pull: { proskliseis: { apodoxi: null } } // διαγραφή μόνο των εκκρεμών
        }
      );
    }

    res.json({ message: "Η πρόσκληση αποδεχτήκε" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα αποδοχής", error: err.message });
  }
});


//απόρριψη πρόσκλησης
router.put("/proskliseis/aporripsi/:index", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") return res.status(403).json({ message: "Μη εξουσιοδοτημένο" });

    const idx = parseInt(req.params.index);
    const professorsCol = client.db("users").collection("Didaskontes");

    const result = await professorsCol.updateOne(
      { didaskonId: req.user.id, [`proskliseis.${idx}.imerominiaapodoxis`]: null, [`proskliseis.${idx}.imerominiaAporripsis`]: null },
      { $set: { [`proskliseis.${idx}.imerominiaAporripsis`]: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Η πρόσκληση δεν ενημερώθηκε (πιθανόν έχει ήδη απαντηθεί)" });
    }

    res.json({ message: "Η πρόσκληση απορρίφθηκε" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα απόρριψης", error: err.message });
  }
});


module.exports = router;






