const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");
//new

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("Diplomatikes");
}

// GET /api/diplomas/my - προβολή διπλωματικής από login φοιτητή
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Απαγορεύεται η πρόσβαση" });
    }

    const diplomas = await getCollection();
    const diploma = await diplomas.findOne({
      "foititis.arithmosMitroou": parseInt(req.user.am) // από το JWT
    });

    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική εργασία" });
    }

    //Αν είναι περατωμένη
    if (diploma.katastasi === "περατωμένη") {
      return res.json({
        title: diploma.titlos,
        status: diploma.katastasi,
        summary: diploma.perigrafi,
        pdf_url: diploma.pdfExtraPerigrafi,
        committee: diploma.trimeriEpitropi,
        assignment_date: diploma.imerominiaAnathesis,
        praktikoHTML: diploma.praktikoHTML || null,
        statusHistory: diploma.proigoumenesKatastaseis || []
      });
    }

    // Ανάκτηση και επεξεργασία χρόνου
    let timeSinceAssignment = null;
    if (diploma.imerominiaAnathesis) {
      const now = new Date();
      const start = new Date(diploma.imerominiaAnathesis);
      const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      timeSinceAssignment = `${days} μέρες`;
    }

    res.json({
      title: diploma.titlos,
      summary: diploma.perigrafi,
      pdf_url: diploma.pdfExtraPerigrafi,
      status: diploma.katastasi,
      committee: diploma.trimeriEpitropi,
      assignment_date: diploma.imerominiaAnathesis,
      time_since_assignment: timeSinceAssignment,
      pdfProxeiroKeimeno: diploma.pdfProxeiroKeimeno || null,
      linkYliko: diploma.linkYliko || null

    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

//POST /api/diplomas/invite , Ερωτημα 3)1 προσκλησεις καθηγητων για επιτροπη
router.post("/invite", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Δεν επιτρέπεται η πρόσβαση." });
    }

    const { didaskonId, onoma, epitheto } = req.body;
    const col = await getCollection();

    // Εντοπισμός διπλωματικής υπό ανάθεση για τον φοιτητή
    const diploma = await col.findOne({
      "foititis.arithmosMitroou": parseInt(req.user.am),
      katastasi: "υπό ανάθεση"
    });

    if (!diploma) {
      return res.status(404).json({ message: "Η διπλωματική δεν είναι υπό ανάθεση ή δεν βρέθηκε." });
    }

    // Έλεγχος για διπλή πρόσκληση
    const alreadyInvited = diploma.proskliseis?.some(p => p.didaskonId === didaskonId);
    if (alreadyInvited) {
      return res.status(400).json({ message: "Ο διδάσκων έχει ήδη προσκληθεί." });
    }

    // Προσθήκη πρόσκλησης
    const result = await col.updateOne(
      { _id: diploma._id },
      {
        $push: {
          proskliseis: {
            didaskonId,
            onoma,
            epitheto,
            apodoxi: null
          }
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Η πρόσκληση δεν καταχωρήθηκε." });
    }

    res.json({ message: "Η πρόσκληση στάλθηκε επιτυχώς." });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});

//προβολη προσκλησεων που εχει κανει ο ιδιος ο φοιτητης (μπορει να μην χρειαστει)
router.get("/my-invites", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Δεν επιτρέπεται η πρόσβαση." });
    }

    const col = await getCollection();
    const diploma = await col.findOne({
      "foititis.arithmosMitroou": parseInt(req.user.am)
    });

    if (!diploma) {
      return res.status(404).json({ message: "Η διπλωματική δεν βρέθηκε." });
    }

    const invites = diploma.proskliseis || [];

    res.json({
      invites: invites.map((inv) => ({
        didaskonId: inv.didaskonId,
        onoma: inv.onoma,
        epitheto: inv.epitheto,
        apodoxi: inv.apodoxi // true, false ή null
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});




router.put("/upload-draft", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Δεν επιτρέπεται η πρόσβαση." });
    }

    const { pdfProxeiroKeimeno, linkYliko } = req.body;

    if (!pdfProxeiroKeimeno) {
      return res.status(400).json({ message: "Απαιτείται link για το πρόχειρο κείμενο." });
    }

    const col = await getCollection();

    const result = await col.updateOne(
      {
        "foititis.arithmosMitroou": parseInt(req.user.am),
        katastasi: "υπό εξέταση"
      },
      {
        $set: {
          pdfProxeiroKeimeno,
          linkYliko
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική σε κατάσταση υπό εξέταση." });
    }

    res.json({ message: "Το πρόχειρο και το υλικό καταχωρήθηκαν επιτυχώς!" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});


router.put("/set-exam-info", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Δεν επιτρέπεται η πρόσβαση." });
    }

    const {
      imerominiaOraExetasis,
      troposExetasis,
      aithousaExetasis,
      syndesmosExetasis
    } = req.body;

    // Έλεγχος υποχρεωτικών πεδίων
    if (!imerominiaOraExetasis || !troposExetasis) {
      return res.status(400).json({ message: "Η ημερομηνία και ο τρόπος εξέτασης είναι υποχρεωτικά." });
    }

    if (troposExetasis === "από κοντά" && !aithousaExetasis) {
      return res.status(400).json({ message: "Απαιτείται αίθουσα εξέτασης για δια ζώσης." });
    }

    if (troposExetasis === "εξ αποστάσεως" && !syndesmosExetasis) {
      return res.status(400).json({ message: "Απαιτείται σύνδεσμος για εξ αποστάσεως εξέταση." });
    }

    const diplomas = await getCollection();
    const result = await diplomas.updateOne(
      {
        "foititis.arithmosMitroou": parseInt(req.user.am),
        katastasi: "υπό εξέταση"
      },
      {
        $set: {
          imerominiaOraExetasis,
          troposExetasis,
          aithousaExetasis: troposExetasis === "από κοντά" ? aithousaExetasis : null,
          syndesmosExetasis: troposExetasis === "εξ αποστάσεως" ? syndesmosExetasis : null
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Η διπλωματική δεν βρέθηκε ή δεν είναι υπό εξέταση." });
    }

    res.json({ message: "Τα στοιχεία της εξέτασης καταχωρήθηκαν!" });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});


//new test
/*function generatePraktikoHTML(diploma) {
  const { foititis, trimeriEpitropi, mainKathigitis } = diploma;
  const dateStr = diploma.imerominiaOraExetasis
    ? new Date(diploma.imerominiaOraExetasis).toLocaleString("el-GR")
    : "—";

  const gradesHTML = (trimeriEpitropi || [])
    .map(member => `<li>${member.onoma} ${member.epitheto}: ${member.vathmos ?? "—"}</li>`)
    .join("");

  const avg = diploma.telikosVathmos ?? "—";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="text-align:center;">ΠΡΑΚΤΙΚΟ ΕΞΕΤΑΣΗΣ ΔΙΠΛΩΜΑΤΙΚΗΣ ΕΡΓΑΣΙΑΣ</h2>
      <p>Ο φοιτητής/η φοιτήτρια <strong>${foititis?.onoma || "-"} ${foititis?.epitheto || "-"}</strong>, με Αριθμό Μητρώου <strong>${foititis?.arithmosMitroou || "-"}</strong>, παρουσίασε τη διπλωματική εργασία με τίτλο <em>"${diploma.titlos || "-"}"</em>.</p>
      <p>Η εξέταση έλαβε χώρα: <strong>${dateStr}</strong></p>
      <h3>Βαθμολογία Επιτροπής:</h3>
      <ul>${gradesHTML}</ul>
      <p><strong>Μέσος Όρος:</strong> ${avg}</p>
      <br/>
      <p style="text-align:right;">Ο Επιβλέπων Καθηγητής: ${mainKathigitis?.onoma || ""} ${mainKathigitis?.epitheto || ""}</p>
    </div>
  `;
}

router.get("/generate-praktiko", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Μόνο φοιτητές έχουν πρόσβαση." });
    }

    const col = await getCollection();

    const diploma = await col.findOne({
      "foititis.arithmosMitroou": parseInt(req.user.am),
      katastasi: "υπό εξέταση"
    });

    if (!diploma) {
      return res.status(404).json({ message: "Η διπλωματική δεν βρέθηκε ή δεν είναι υπό εξέταση." });
    }

    const html = generatePraktikoHTML(diploma);

    res.send(html);
  } catch (err) {
    res.status(500).send("Σφάλμα κατά τη δημιουργία πρακτικού.");
  }
});*/

router.get("/praktiko-data", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Μόνο φοιτητές έχουν πρόσβαση." });
    }

    const col = await getCollection();
    const diploma = await col.findOne({
      "foititis.arithmosMitroou": parseInt(req.user.am),
      katastasi: "υπό εξέταση"
    });

    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε η διπλωματική σας." });
    }

    res.json({
      onoma: diploma.foititis.onoma,
      epitheto: diploma.foititis.epitheto,
      am: diploma.foititis.arithmosMitroou,
      titlos: diploma.titlos,
      trimeriEpitropi: diploma.trimeriEpitropi || [],
      telikosVathmos: diploma.telikosVathmos || null,
      troposExetasis: diploma.troposExetasis,
      imerominiaOraExetasis: diploma.imerominiaOraExetasis || null,
      mainKathigitis: diploma.mainKathigitis || {}
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα διακομιστή", error: err.message });
  }
});


module.exports = router;

