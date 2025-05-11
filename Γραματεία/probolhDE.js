const { MongoClient } = require("mongodb");

// Ορισμός connection URI (MongoDB τοπικά)
const uri = "mongodb://localhost:27017";

// Δημιουργία client
const client = new MongoClient(uri);

// Μεταβλητή για αποθήκευση των διπλωματικών
let diplomatikesData = [];

// Ασυγχρονη συνάρτηση για τη επίστροφή διπλωματικών
async function all_diplomatikes() {
    try {
        // Σύνδεση στη βάση δεδομένων
        await client.connect();
        console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

        // Επιλογή βάσης δεδομένων και συλλογής
        const database = client.db("users");  // Όνομα βάσης
        const collection = database.collection("Diplomatikes");  // Όνομα συλλογής

        // Επιστροφή όλων των διπλωματικών από τη συλλογή
        diplomatikesData = await collection.find({
            $or: [
                { katastasi : "Ενεργή" },
                { katastasi : "υπό εξέταση"}
            ]
        }).toArray();
        console.log("📌 Δεδομένα χρηστών:", diplomatikesData);

    } catch (error) {
        console.error("❌ Σφάλμα σύνδεσης:", error);
    } finally {
        console.log("🔌 Σύνδεση στη MongoDB έκλεισε.");
    }
}

// Συγχρονη συνάρτηση για τη σύγκριση ημερομηνιών και υπολογισμό χρόνου
function calculateTimeSinceSubmission() {

    // Λήψη της τρέχουσας ημερομηνίας
    const currentDate = new Date();

    // Υπολογισμός χρόνου που έχει περάσει από την ημερομηνία υποβολής
    diplomatikesData.forEach((doc) => {
        if (doc.anathesh_date) {
            const anathesh_date = new Date(doc.anathesh_date); // Μετατροπή σε αντικείμενο Date
            const timeDifference = currentDate - anathesh_date; // Διαφορά σε milliseconds

            // Μετατροπή της διαφοράς σε ημέρες
            const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

            console.log(`📌 Διπλωματική: ${doc.theme}`);
            console.log(`   Υποβλήθηκε πριν από: ${daysPassed} ημέρες`);
        } else {
            console.log(`📌 Διπλωματική: ${doc.theme}`);
            console.log("   Δεν υπάρχει ημερομηνία υποβολής.");
        }
    });
}

//Το await δουλέυει σαν mutex, περιμένει να ολοκληρωθεί η ασύγχρονη συνάρτηση πριν προχωρήσει στην επόμενη γραμμή κώδικα
// Αν η ασύγχρονη συνάρτηση δεν έχει ολοκληρωθεί, τότε δεν μπορείς να κάνεις υπολογισμούς με τα δεδομένα που επιστρέφει

// Εκτέλεση των συναρτήσεων
//main function to run the async function and then the sync function
async function main() {
    await all_diplomatikes(); // Φόρτωση δεδομένων από τη βάση και περίμενε να ολοκληρωθεί πριν κανεις υπολογισμούς
    calculateTimeSinceSubmission(); // Υπολογισμός χρόνου από την ημερομηνία υποβολής
}

main(); // Εκτέλεση της κύριας συνάρτησης