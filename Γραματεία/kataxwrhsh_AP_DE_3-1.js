const express = require("express"); // για ένωση mongodb με http server
const { MongoClient, ObjectId } = require("mongodb"); //για σύνδεση με mongodb και να μετατρέψουμε το id σε objectId
const bodyParser = require("body-parser"); // για parsing των δεδομένων της φόρμας

const app = express(); // Δημιουργία express app
const port = 3000; // Θύρα του server

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Middleware για parsing των δεδομένων της φόρμας
app.use(bodyParser.urlencoded({ extended: true })); // Χρησιμοποιούμε το body-parser για να μπορέσουμε να διαβάσουμε τα δεδομένα που στέλνει η φόρμα

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
            { _id: ObjectId(id), status: "Ενεργή" }, // Εύρεση των ενεργών διπλωματικών με βάση το ID 
            {
                $set: {
                    protocolNumber: protocolNumber,
                },
            }
        );

        if (result.matchedCount === 0) {
            res.send(`❌ Δεν βρέθηκε διπλωματική με ID: ${id} , είτε το ID είναι λάθος είτε η διπλωματική δεν είναι ενεργή.`);
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