const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("users").collection("xristes");
}

// LOGIN route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const col = await getCollection();
      const doc = await col.findOne({ "students.username": username });
  
      if (!doc) return res.status(404).json({ message: "Ο χρήστης δεν βρέθηκε" });
  
      const student = doc.students.find(s => s.username === username);
  
      if (!student || student.password !== password) {
        return res.status(401).json({ message: "Λάθος username ή κωδικός" });
      }
  
      const token = jwt.sign({
        am: student.arithmosMitroou,
        username: student.username,
        role: "student"
      }, "MY_SECRET_KEY", { expiresIn: "2h" });
  
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: "Σφάλμα κατά το login", error: err.message });
    }
  });

  module.exports = router;
