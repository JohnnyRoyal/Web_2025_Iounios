const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Συνάρτηση για τη μορφοποίηση ημερομηνίας σε ευρωπαϊκή μορφή
// Η μορφή είναι: 01/01/2023, 12:00
// όπου η ημερομηνία είναι σε μορφή DD/MM/YYYY και η ώρα σε μορφή HH:MM
function formatDateEU(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

router.post("/", authMiddleware, async (req, res) => {
  const { id } = req.body;

  try {
    await client.connect();
    const database = client.db("users");
    const collection = database.collection("Diplomatikes");

    // Βρες τη διπλωματική
    //Φτιάνω το id της διπλωματικής από το string που έρχεται από το frontend που ταν το id
    // και το μετατρέπω σε ObjectId για να μπορέσω να το χρησιμοποιήσω στη MongoDB
    //κάτι buggare με τα  ObkectId και ήθελε το new ObjectId(id)
    const diploma = await collection.findOne({ _id: new ObjectId(id) });

    if (!diploma) {
      return res.status(404).json({ message: `❌ Δεν βρέθηκε διπλωματική με ID: ${id}.` });
    }

    // Έλεγχος αν ο χρήστης είναι ο κύριος καθηγητής
    if (
      !diploma.mainKathigitis ||
      diploma.mainKathigitis.didaskonId !== req.user.id
    ) {
      return res.status(403).json({ message: "❌ Μόνο ο κύριος καθηγητής της διπλωματικής μπορεί να δει την ανακοίνωση." });
    }

    // Πάρε τα πεδία παρουσίασης και τα επιπλέον στοιχεία
    const {
      imerominiaOraExetasis,
      troposExetasis,
      aithousaExetasis,
      syndesmosExetasis,
      titlos,
      perigrafi,
      foititis,
      mainKathigitis
    } = diploma;

    // Μετατροπή ημερομηνίας σε ευρωπαϊκή μορφή
    const imerominiaOraExetasisEU = formatDateEU(imerominiaOraExetasis);

    console.log("📄 Πληροφορίες διπλωματικής:", {diploma})

    // Έλεγχος αν υπάρχουν όλα τα απαραίτητα πεδία
    if (!imerominiaOraExetasis || !troposExetasis || (!aithousaExetasis && !syndesmosExetasis)) {
      return res.status(400).json({
        message: "❌ Δεν έχουν συμπληρωθεί όλες οι λεπτομέρειες παρουσίασης από τον φοιτητή/τρια."
      });
    }

    // Δημιουργία ανακοίνωσης
    let anakoinosi = `Ανακοίνωση Εξέτασης Διπλωματικής Εργασίας\n\n`;
    anakoinosi += `Η εξέταση της διπλωματικής εργασίας θα πραγματοποιηθεί στις ${imerominiaOraExetasis} `;
    anakoinosi += `με τρόπο: ${troposExetasis}. `;

    if (troposExetasis.toLowerCase().includes("εξ αποστάσεως") && syndesmosExetasis) {
      anakoinosi += `Ο σύνδεσμος για την εξέταση είναι: ${syndesmosExetasis}.`;
    } else if (aithousaExetasis) {
      anakoinosi += `Η εξέταση θα γίνει στην αίθουσα: ${aithousaExetasis}.`;
    }

    // στελνουμε την ανακοίνωση μαζί με τα υπόλοιπα στοιχεία
    res.status(200).json({
      anakoinosiExetasis: anakoinosi,
      imerominiaOraExetasis: imerominiaOraExetasisEU,
      troposExetasis,
      aithousaExetasis,
      syndesmosExetasis,
      titlos,
      perigrafi,
      foititis,
      mainKathigitis
    });

  } catch (error) {
    console.error("❌ Σφάλμα:", error);
    res.status(500).json({ message: "❌ Σφάλμα κατά την ανάκτηση της ανακοίνωσης." });
  } finally {
    await client.close();
  }
});

module.exports = router;