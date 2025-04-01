const { MongoClient } = require("mongodb");

// Ορισμός connection URI (αν τρέχεις MongoDB τοπικά)
const uri = "mongodb://localhost:27017";

// Δημιουργία client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Σύνδεση στη βάση δεδομένων
        await client.connect();
        console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

        // Επιλογή βάσης δεδομένων και συλλογής
        const database = client.db("users");  // Όνομα βάσης
        const collection = database.collection("xristes");  // Όνομα συλλογής

        // Test Query: Ανάκτηση δεδομένων
        const documents = await collection.find({}).limit(5).toArray();
        console.log("📌 Δεδομένα χρηστών:", documents);

    } catch (error) {
        console.error("❌ Σφάλμα σύνδεσης:", error);
    } finally {
        // Κλείσιμο σύνδεσης
        await client.close();
        console.log("🔌 Σύνδεση στη MongoDB έκλεισε.");
    }
}

// Εκτέλεση του test
run();
