const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Υπολογισμός χρόνου από την ανάθεση για να δούμε αν θα πάρει τον πλήρη βαθμό ή όχι
function calculateTimeSinceSubmission(imerominiaAnathesis) {
  if (!imerominiaAnathesis) return "Δεν υπάρχει ημερομηνία ανάθεσης.";
  const currentDate = new Date();
  const submissionDate = new Date(imerominiaAnathesis);
  const timeDifference = currentDate - submissionDate; // Διαφορά σε milliseconds
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Μετατροπή σε ημέρες , επιστρέφει πόσες μέρες έχουν περάσει από την ανάθεση σε αριθμό
}

// Καταχώρηση βαθμών από διδάσκοντα
router.post("/", authMiddleware, async (req, res) => {
  const { id, quality, duration, text, presentation } = req.body; // id = id διπλωματικής


  // Αν ΔΕΝ στέλνονται βαθμοί, απλά επιστρέφει τα δεδομένα της τριμελούς και τον τελικό βαθμό ,για πριν πατηθεί το κουμπί καταχώρησης βαθμών
  // Αυτό γίνεται για να μπορεί ο διδάσκων να δει τα δεδομένα της τριμελούς επιτροπής και τον τελικό βαθμό πριν καταχωρήσει τους βαθμούς
  // Αν δεν στέλνονται βαθμοί, τότε δεν χρειάζεται να γίνει έλεγχος για το αν είναι αριθμοί 0-10
  if (
    quality === undefined &&
    duration === undefined &&
    text === undefined &&
    presentation === undefined
  ) {
    try {
      await client.connect();
      const db = client.db("users");
      const collection = db.collection("Diplomatikes");

      const diploma = await collection.findOne(
        { _id: new ObjectId(id) },
        { projection: { trimeriEpitropi: 1, telikosVathmos: 1 } }
      );
      if (!diploma) {
        return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική." });
      }
      return res.status(200).json({
        trimeriEpitropi: diploma.trimeriEpitropi || [],
        telikosVathmos: diploma.telikosVathmos ?? null
      });
    } catch (err) {
      return res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση βαθμών." });
    } finally {
      await client.close();
    }
  }

  // Έλεγχος τιμών
  if (
    [quality, duration, text, presentation].some(
      (v) => typeof v !== "number" || v < 0 || v > 10
    )
  ) {
    return res.status(400).json({ message: "Όλοι οι βαθμοί πρέπει να είναι αριθμοί 0-10." });
  }

  try {
    await client.connect();
    const db = client.db("users");
    const collection = db.collection("Diplomatikes");

    // Βρες τη διπλωματική
    const diploma = await collection.findOne({ _id: new ObjectId(id) });
    if (!diploma) {
      return res.status(404).json({ message: "Δεν βρέθηκε διπλωματική." });
    }

    //Τραβαω την ημερομηνία ανάθεσης από τη διπλωματική για να υπολογίσω αν θα πάρει τον πλήρη βαθμό ή όχι
    const xronosApoAnathesi = calculateTimeSinceSubmission(diploma.imerominiaAnathesis);

    // Έλεγχος αν έχουν περάσει πάνω από 1.5 χρόνο (547 ημέρες) από την ανάθεση
    // Αν ναι, τότε ο βαθμός duration θα είναι 0
    if (xronosApoAnathesi !== null && xronosApoAnathesi > 547) {
      duration = 0;
      return res.status(200).json({ 
        message:`Ο βαθμός duration είναι 0 επειδή έχουν περάσει πάνω από 1.5 χρόνο από την ανάθεση. Συγκεκριμένα ${xronosApoAnathesi} ημέρες.`,
        errorType: "duration_zero_due_to_delay", //Μηδενίζεται ο βαθμός duration λόγω καθυστέρησης
        duration: 0
      });
    }

    // Υπολογισμός ζυγισμένου μέσου όρου για τον τελικό βαθμό
    // Οι βαρύτητες είναι όπως ορίζονται στο έγγραφο της διπλωματικής εργασίας
    // quality: 60%, duration: 15%, text: 15%, presentation: 10%
    // Όπως φαίνεται στο https://www.ceid.upatras.gr/sites/default/files/pages/diplomatiki_ergasia_tmiyp_0.pdf στην Διαδικασία Αξιολόγησης και Παρουσίασης
    const finalGrade =
    quality * 0.6 +
    duration * 0.15 +
    text * 0.15 +
    presentation * 0.1;

    // Πέρνω το id του διδάσκοντα από το token  για να το συγκρίνω με το didaskonId της τριμελούς επιτροπής
    const didaskonId = req.user.id;

    const result = await collection.updateOne(
        { 
            _id: new ObjectId(id), // Βρες τη διπλωματική με το id
            "trimeriEpitropi.didaskonId": didaskonId // Βρες το μέλος με το σωστό didaskonId ανάμεσα στα μέλη της τριμελούς επιτροπής (αυτός που καταχωρεί τους βαθμούς που το δίχνει το token)
        },
        { 
            $set: { 
            "trimeriEpitropi.$[elem].vathmosAnalytika": {
                quality,
                duration,
                text,
                presentation
            },
            // Ενημέρωση του ζυγισμένου βαθμού για το μέλος της τριμελούς επιτροπής που καταχωρεί τους βαθμούς πάλι σύμφωνα με το didaskonId
            "trimeriEpitropi.$[elem].vathmos": Number(finalGrade.toFixed(2)), // toFixed Στρογγυλοποιώ τον ζυγισμένο βαθμό σε 2 δεκαδικά ψηφία , το Number() τον μετατρέπει σε αριθμό
            }
        },
        {
            arrayFilters: [
            { "elem.didaskonId": didaskonId } // Φιλτράρω για να ενημερώσω μόνο το μέλος της τριμελούς επιτροπής που καταχωρεί τους βαθμούς , μόνο το object που έχει το didaskonId του διδάσκοντα που καταχωρεί τους βαθμούς
            ]
        }
    );

    // Έλεγχος εαν υπάρχει object mainKathigitis στη διπλωματική , μετά μετατρέπει τα didaskonId σε string για να συγκρίνει  το didaskonId του διδάσκοντα που καταχωρεί τους βαθμούς με αυτό του object
    const isMainKathigitis = diploma.mainKathigitis && String(diploma.mainKathigitis.didaskonId) === String(didaskonId);

    if (isMainKathigitis) {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { vathmosEpiBlepon: Number(finalGrade.toFixed(2)) } } // Ενημέρωση του ζυγισμένου βαθμού της διπλωματικής για τον κύριο καθηγητή
      );
    }

    // Φέρε το ανανεωμένο array τριμελούς και βάλτο στην μεταβλητή updated
    const updated = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { trimeriEpitropi: 1, _id: 0 } }
    );

    // Έλεγχος αν όλα τα μέλη έχουν βάλει βαθμό με το every επιστρέφει true αν όλα τα στοιχεία του array πληρούν την συνθήκη ,
    // εδώ για κάθε member του trimeriEpitropi ελέγχει αν το vathmos είναι αριθμός (το null δεν είναι αριθμός) και δεν είναι NaN
    const allHaveGrade = updated.trimeriEpitropi.every(
      member => typeof member.vathmos === "number" && !isNaN(member.vathmos)
    );

    if (allHaveGrade) {
      // Υπολογισμός μέσου όρου
      const sum = updated.trimeriEpitropi.reduce((acc, member) => acc + member.vathmos, 0); // με το redduce μπαίνουν όλα σε ένα σύνολο και μετά τα προσθέτει αρχικά από 0
      const avg = Number((sum / updated.trimeriEpitropi.length).toFixed(2)); // Υπολογίζει τον μέσο όρο και τον στρογγυλοποιεί σε 2 δεκαδικά ψηφία

      // Κάνε set το telikosVathmos
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { telikosVathmos: avg } }
      );
    }

    // μετά το update του telikosVathmos  ξαναφέρνω το ανανεωμένο array τριμελούς επιτροπής και τον τελικό βαθμό
    const updatedfinal = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { trimeriEpitropi: 1, telikosVathmos: 1 } }
    );

    // Επιστρέφω το ανανεωμένο array τριμελούς επιτροπής και τον τελικό βαθμό
    res.status(200).json({
      message: "✅ Οι βαθμοί καταχωρήθηκαν.",
      trimeriEpitropi: updatedfinal.trimeriEpitropi,
      telikosVathmos: updatedfinal.telikosVathmos,
      _id: updatedfinal._id,
      errorType: null // Πλήρης βαθμός, δεν υπάρχει σφάλμα
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα κατά την καταχώρηση βαθμών." });
  } finally {
    await client.close();
  }
});

module.exports = router;