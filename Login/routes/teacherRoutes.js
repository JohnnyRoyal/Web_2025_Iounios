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
    const professor = await professorsCol.findOne({ didaskonId: req.user.id });

        if (!professor) {
          return res.status(404).json({ message: "Δεν βρέθηκαν στοιχεία διδάσκοντα." });
        }

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

    //Προσθήκη στην trimelisEpitropi αν δεν υπάρχει ήδη
    const alreadyExists = (diploma.trimelisEpitropi || []).some(member => member.didaskonId === req.user.id);
    if (!alreadyExists) {
      await diplomasCol.updateOne(
        { _id: diploma._id },
        {
          $push: {
            trimelisEpitropi: {
              didaskonId: req.user.id,
              onoma: professor.onoma,
              epitheto: professor.epitheto,
              vathmos: null
            }
          }
        }
      );
    }

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

      // ✅ Καθάρισε και τις αντίστοιχες προσκλήσεις από τους διδάσκοντες
      await professorsCol.updateMany(
        {
          proskliseis: {
            $elemMatch: {
              titlos: diploma.titlos,
              perigrafi: diploma.perigrafi,
              imerominiaApodoxis: null
              
            }
          }
        },
        {
          $pull: {
            proskliseis: {
            titlos: diploma.titlos,
            perigrafi: diploma.perigrafi,
            imerominiaApodoxis: null
            
           }
          }
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
    const diplomasCol = client.db("users").collection("Diplomatikes");

    const result = await professorsCol.updateOne(
      { didaskonId: req.user.id, [`proskliseis.${idx}.imerominiaApodoxis`]: null, [`proskliseis.${idx}.imerominiaAporripsis`]: null },
      { $set: { [`proskliseis.${idx}.imerominiaAporripsis`]: new Date() } }
    );

    if (result.modifiedCount === 0) {
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
      { $set: { "proskliseis.$.apodoxi": false } }
    );

    res.json({ message: "Η πρόσκληση απορρίφθηκε" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα απόρριψης", error: err.message });
  }
});


// Ανάθεση θέματος σε φοιτητή
router.put("/anathesi", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
    }

    const { themaId, arithmosMitroou, onoma, epitheto } = req.body;
    if (!themaId || !arithmosMitroou || !onoma || !epitheto) {
      return res.status(400).json({ message: "Λείπουν απαιτούμενα πεδία" });
    }

    const db = client.db("users");
    const diplomasCol = db.collection("Diplomatikes");
    const studentsCol = db.collection("students");

    const thema = await diplomasCol.findOne({ _id: new ObjectId(themaId) });

    if (!thema) {
      return res.status(404).json({ message: "Το θέμα δεν βρέθηκε" });
    }

    if (thema.katastasi !== "διαθέσιμη προς ανάθεση") {
      return res.status(400).json({ message: "Το θέμα δεν είναι διαθέσιμο" });
    }

    if (thema.foititis) {
      return res.status(400).json({ message: "Το θέμα έχει ήδη ανατεθεί" });
    }

    //Αναζήτηση φοιτητή
    const student = await studentsCol.findOne({
      arithmosMitroou: parseInt(arithmosMitroou),
      onoma: onoma.trim(),
      epitheto: epitheto.trim()
    });

    if (!student) {
      return res.status(404).json({ message: "Δεν βρέθηκε φοιτητής με αυτά τα στοιχεία" });
    }

    //Ανάθεση
    await diplomasCol.updateOne(
      { _id: thema._id },
      {
        $set: {
          foititis: {
            arithmosMitroou: parseInt(arithmosMitroou),
            onoma: onoma.trim(),
            epitheto: epitheto.trim()
          },
          katastasi: "υπό ανάθεση"
        }
      }
    );

    res.json({ message: "Η ανάθεση έγινε επιτυχώς" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα ανάθεσης", error: err.message });
  }
});

/*
// Ανάκληση ανάθεσης θέματος από καθηγητή
router.put("/anaklisi", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν επιτρέπεται" });
    }

    const { themaId } = req.body;
    if (!themaId) {
      return res.status(400).json({ message: "Δεν δόθηκε θέμα" });
    }

    const diplomasCol = client.db("users").collection("Diplomatikes");

    const thema = await diplomasCol.findOne({ _id: new ObjectId(themaId) });

    if (!thema) {
      return res.status(404).json({ message: "Το θέμα δεν βρέθηκε" });
    }

    if (thema.katastasi !== "υπό ανάθεση") {
      return res.status(400).json({ message: "Η ανάθεση δεν μπορεί να ακυρωθεί" });
    }

    if (!thema.mainKathigitis || thema.mainKathigitis.didaskonId !== req.user.id) {
      return res.status(403).json({ message: "Δεν είστε ο υπεύθυνος καθηγητής του θέματος" });
    }

    await diplomasCol.updateOne(
      { _id: thema._id },
      {
        $unset: { foititis: "" },
        $set: { katastasi: "διαθέσιμη προς ανάθεση" }
      }
    );

    res.json({ message: "Η ανάθεση ακυρώθηκε επιτυχώς" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα ανάκλησης ανάθεσης", error: err.message });
  }
});
*/


// GET /api/teacher/diplomatikes - προβολή διπλωματικών καθηγητή με φιλτρα αναζητησης 
router.get("/diplomatikes", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
    }

    const diplomasCol = client.db("users").collection("Diplomatikes");

    const query = {
      $or: [
        { "mainKathigitis.didaskonId": req.user.id },
        { "trimelisEpitropi.didaskonId": req.user.id }
      ]
    };

    // Προαιρετικό φίλτρο κατάστασης
    if (req.query.katastasi) {
      query.katastasi = req.query.katastasi;
    }

    // Φίλτρο ρόλου (με override της $or αν προσδιορίζεται συγκεκριμένος ρόλος)
    if (req.query.rolos === "epivlepon") {
      query["mainKathigitis.didaskonId"] = req.user.id;
      delete query.$or;
    } else if (req.query.rolos === "melos") {
      query["trimelisEpitropi.didaskonId"] = req.user.id;
      query["mainKathigitis.didaskonId"] = { $ne: req.user.id }; // ΔΕΝ είναι επιβλέπων
      delete query.$or;
}


    const results = await diplomasCol.find(query).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση", error: err.message });
  }
});


router.get("/diplomatikes/:id", authMiddleware, async (req, res) => {
  try {
    const diplomasCol = client.db("users").collection("Diplomatikes");
    const id = req.params.id;

    const diploma = await diplomasCol.findOne({ _id: new ObjectId(id) });

    if (!diploma) return res.status(404).json({ message: "Διπλωματική δεν βρέθηκε" });

    res.json(diploma);
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα ανάκτησης διπλωματικής", error: err.message });
  }
});

// Ερώτημα 5 - στατιστικά διπλωματικών
router.get("/statistics", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Δεν επιτρέπεται η πρόσβαση" });
    }

    const col = await getDiplomaCollection();
    const teacherId = req.user.id;

    // Διπλωματικές όπου είναι επιβλέπων
    const mainDiplomas = await col.find({ "mainKathigitis.didaskonId": teacherId }).toArray();

    // Διπλωματικές όπου είναι ΜΟΝΟ μέλος
    const memberDiplomas = await col.find({
      "trimelisEpitropi.didaskonId": teacherId,
      "mainKathigitis.didaskonId": { $ne: teacherId }
    }).toArray();

    // Υπολογισμός για main
    const finishedMain = mainDiplomas.filter(d => d.katastasi === "περατωμένη");
    const avgMainDays = finishedMain.length > 0
      ? Math.round(
          finishedMain.reduce((acc, d) => acc + (
            (new Date(d.dateUpdated) - new Date(d.dateCreated)) / (1000 * 60 * 60 * 24)
          ), 0) / finishedMain.length
        )
      : 0;
    const avgMainGrade = finishedMain.length > 0
      ? (
          finishedMain
            .filter(d => typeof d.telikosVathmos === "number")
            .reduce((acc, d) => acc + d.telikosVathmos, 0) / finishedMain.length
        ).toFixed(2)
      : "0.00";

    // Υπολογισμός για μέλος
    const finishedMember = memberDiplomas.filter(d => d.katastasi === "περατωμένη");
    const avgMemberDays = finishedMember.length > 0
      ? Math.round(
          finishedMember.reduce((acc, d) => acc + (
            (new Date(d.dateUpdated) - new Date(d.dateCreated)) / (1000 * 60 * 60 * 24)
          ), 0) / finishedMember.length
        )
      : 0;
    const avgMemberGrade = finishedMember.length > 0
      ? (
          finishedMember
            .filter(d => typeof d.telikosVathmos === "number")
            .reduce((acc, d) => acc + d.telikosVathmos, 0) / finishedMember.length
        ).toFixed(2)
      : "0.00";

    // Τελική απάντηση
    res.json({
      main: {
        count: mainDiplomas.length,
        avgDays: avgMainDays,
        avgGrade: avgMainGrade
      },
      member: {
        count: memberDiplomas.length,
        avgDays: avgMemberDays,
        avgGrade: avgMemberGrade
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα στατιστικών", error: err.message });
  }
});




module.exports = router;






