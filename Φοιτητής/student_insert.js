const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function insertStudents() {
  try {
    await client.connect();
    const db = client.db("users");
    const collection = db.collection("students");

    const students = JSON.parse(fs.readFileSync("student.json", "utf8"));

    await collection.updateOne(
      {},
      { $set: { students: students } },
      { upsert: true }
    );

    console.log("✅ Οι φοιτητές εισήχθησαν επιτυχώς.");
  } catch (err) {
    console.error("❌ Σφάλμα:", err);
  } finally {
    await client.close();
  }
}

insertStudents();
