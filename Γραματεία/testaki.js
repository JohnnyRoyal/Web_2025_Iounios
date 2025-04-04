const { MongoClient } = require("mongodb");

// Ορισμός connection URI (MongoDB τοπικά)
const uri = "mongodb://localhost:27017";

// Δημιουργία client
const client = new MongoClient(uri);

// Ασυγχρονη συνάρτηση για τη σύγκριση ημερομηνιών και υπολογισμό χρόνου
async function calculateTimeSinceSubmission() {
    try {
        // Σύνδεση στη βάση δεδομένων
        await client.connect();
        console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

        // Επιλογή βάσης δεδομένων και συλλογής
        const database = client.db("users");  // Όνομα βάσης
        const collection = database.collection("diplomatikes");  // Όνομα συλλογής

        // Λήψη της τρέχουσας ημερομηνίας
        const currentDate = new Date();

        // Εύρεση όλων των εγγράφων
        const documents = await collection.find({}).toArray();

        // Υπολογισμός χρόνου που έχει περάσει από την ημερομηνία υποβολής
        documents.forEach((doc) => {
            if (doc.submissionDate) {
                const submissionDate = new Date(doc.submissionDate); // Μετατροπή σε αντικείμενο Date
                const timeDifference = currentDate - submissionDate; // Διαφορά σε milliseconds

                // Μετατροπή της διαφοράς σε ημέρες
                const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

                console.log(`📌 Διπλωματική: ${doc.title}`);
                console.log(`   Υποβλήθηκε πριν από: ${daysPassed} ημέρες`);
            } else {
                console.log(`📌 Διπλωματική: ${doc.title}`);
                console.log("   Δεν υπάρχει ημερομηνία υποβολής.");
            }
        });

    } catch (error) {
        console.error("❌ Σφάλμα σύνδεσης:", error);
    } finally {
        // Κλείσιμο σύνδεσης
        await client.close();
        console.log("🔌 Σύνδεση στη MongoDB έκλεισε.");
    }
}

// Εκτέλεση της συνάρτησης
calculateTimeSinceSubmission();