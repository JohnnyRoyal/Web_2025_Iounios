//Λύση ερωτήματος 2 φοιτητη (επεξεργασία προφιλ)
const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const authMiddleware = require("../middlewares/authMiddleware");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("students");
}

//εμφάνιση τρεχόντων στοιχείων με GET
router.get("/me", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
      }
  
      const col = await getCollection();
      const student = await col.findOne({ arithmosMitroou: parseInt(req.user.am) });
  
      if (!student) return res.status(404).json({ message: "Ο φοιτητής δεν βρέθηκε" });
  
      res.json({
        email: student.email || "",
        taxydromikiDieythinsi: student.taxydromikiDieythinsi || "",
        kinito: student.kinito || "",
        stathero: student.stathero || ""
      });
    } catch (err) {
      res.status(500).json({ message: "Σφάλμα", error: err.message });
    }
  });
  

  //αρχική καταχώρηση ή τροποποίηση με PUT
  router.put("/me", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Δεν έχετε πρόσβαση" });
      }
  
      const { email, taxydromikiDieythinsi, kinito, stathero } = req.body;
  
      const col = await getCollection();
      const result = await col.updateOne(
        { arithmosMitroou: parseInt(req.user.am) },
        {
          $set: {
            email,
            taxydromikiDieythinsi,
            kinito,
            stathero
          }
        }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Ο φοιτητής δεν βρέθηκε" });
      }
  
      res.json({ message: "Τα στοιχεία επικοινωνίας καταχωρήθηκαν/ενημερώθηκαν επιτυχώς!" });
    } catch (err) {
      res.status(500).json({ message: "Σφάλμα", error: err.message });
    }
  });
  
  module.exports = router;
