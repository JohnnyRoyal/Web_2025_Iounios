const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const { Builder } = require("xml2js");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getDiplomasCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("Diplomatikes");
}

// Δημόσιο endpoint χωρίς authentication
router.get("/", async (req, res) => {
  console.log("NO LOGIN ROUTE CALLED", req.query); // Για debugging axxxxxxxxx
  try {
    const { from, to, format } = req.query;
    const diplomas = await getDiplomasCollection();

    // Μετατροπή ημερομηνιών από ευρωπαϊκή μορφή (DD/MM/YYYY) σε ISO 8601
    const convertToISODate = (date) => {
      const [day, month, year] = date.split("/");
      return new Date(`${year}-${month}-${day}`);
    };

    // Φιλτράρισμα με βάση ημερομηνία αν δοθούν παράμετροι
    let filter = { katastasi: "υπό εξέταση" };
    if (from || to) {
      filter.imerominiaOraExetasis = {};
      if (from) filter.imerominiaOraExetasis.$gte = new Date(from + "T00:00:00.000Z"); // Προσθήκη ώρας για να είναι ακριβής η σύγκριση μέσα στην ΒΔ γιατί χωρίς ώρα δεν γύρναγε τίποτα
      if (to) filter.imerominiaOraExetasis.$lte = new Date(to + "T23:59:59.999Z"); // Τέλος της ημέρας για να συμπεριλάβει όλες τις εγγραφές της ημέρας εαν ψάξω για μέσα σε μία μέρα
    }

    const data = await diplomas.find(filter).toArray();
    const filteredData = data.map((doc) => ({
      _id: doc._id.toString(),
      titlos: doc.titlos,
      perigrafi: doc.perigrafi,
      pdf_extra_perigrafi: doc.pdfExtraPerigrafi,
      imerominia_anakinosis_diplomatikis: doc.imerominiaOraExetasis,
      tropos_exetasis: doc.troposExetasis,
      aithousaExetasis: doc.troposExetasis === "δια ζώσης" ? doc.aithousaExetasis : null, // για ασφάλεια ούτος η άλλως το αίθουσα εξέτασης θα είναι null αν δεν είναι διά ζώσης
      syndesmosExetasis: doc.troposExetasis === "εξ αποστάσεως" ? doc.syndesmosExetasis : null, //το ίδιο και για το σύνδεσμο εξέτασης
    }));

    console.log("Filtered Data:", filteredData);

    if (format === "xml") {
      // Επιστροφή ως XML
      const builder = new Builder({ rootName: "diplomas", headless: true }); // Δημιουργία builder για XML
      const xml = builder.buildObject({ diplomas: filteredData }); // Μετατροπή σε XML
      res.type("application/xml").send(xml);
    } else {
      // Default JSON
      res.json(filteredData);
    }
  } catch (error) {
    res.status(500).send("Σφάλμα κατά την ανάκτηση δεδομένων.");
  }
});

module.exports = router;