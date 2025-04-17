const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Middleware για parsing των δεδομένων της φόρμας
app.use(bodyParser.urlencoded({ extended: true }));

// Route για την εμφάνιση της φόρμας
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Route για την καταχώρηση του ΑΠ
app.post("/set-ap", async (req, res) => {
    const { id, protocolNumber } = req.body; // Λήψη δεδομένων από τη φόρμα

    try {
        await client.connect();
        const database = client.db("users");
        const collection = database.collection("diplomatikes");

        // Ενημέρωση της διπλωματικής με το νέο ΑΠ
        const result = await collection.updateOne(
            { _id: ObjectId(id) }, // Εύρεση της διπλωματικής με βάση το ID
            {
                $set: {
                    protocolNumber: protocolNumber,
                },
            }
        );

        if (result.matchedCount === 0) {
            res.send(`❌ Δεν βρέθηκε διπλωματική με ID: ${id}`);
        } else {
            res.send(`✅ Ενημερώθηκε η διπλωματική με ID: ${id}`);
        }
    } catch (error) {
        console.error("❌ Σφάλμα κατά την ενημέρωση:", error);
        res.status(500).send("❌ Σφάλμα κατά την ενημέρωση.");
    } finally {
        await client.close();
    }
});

// Εκκίνηση του server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});