const { MongoClient } = require("mongodb");

// Ορισμός connection URI (MongoDB τοπικά)
const uri = "mongodb://localhost:27017";

// Δημιουργία client
const client = new MongoClient(uri);


// Συνάρτηση για ενημέρωση κατάστασης σε "Ενεργή"
async function setActiveDiplomatiki(id, protocolNumber, examRecord) {
    try {
        await client.connect();
        const database = client.db("users");
        const collection = database.collection("diplomatikes");

        const result = await collection.updateOne(
            { _id: id }, // Εύρεση της διπλωματικής με βάση το ID
            {
                $set: {
                    status: "Ενεργή",
                    protocolNumber: protocolNumber,
                },
            }
        );

        console.log(`✅ Ενημερώθηκε η διπλωματική με ID: ${id}`);
    } catch (error) {
        console.error("❌ Σφάλμα κατά την ενημέρωση:", error);
    } finally {
        await client.close();
    }
}

// Συνάρτηση για ακύρωση ανάθεσης θέματος
async function cancelDiplomatiki(id, assemblyNumber, assemblyYear, cancellationReason) {
    try {
        await client.connect();
        const database = client.db("users");
        const collection = database.collection("diplomatikes");

        const result = await collection.updateOne(
            { _id: id }, // Εύρεση της διπλωματικής με βάση το ID
            {
                $set: {
                    status: "Ακυρωμένη",
                    assemblyNumber: assemblyNumber,
                    assemblyYear: assemblyYear,
                    cancellationReason: cancellationReason,
                },
            }
        );

        console.log(`✅ Ακυρώθηκε η διπλωματική με ID: ${id}`);
    } catch (error) {
        console.error("❌ Σφάλμα κατά την ακύρωση:", error);
    } finally {
        await client.close();
    }
}

// Συνάρτηση για αλλαγή κατάστασης σε "Περατωμένη"
async function completeDiplomatiki(id, grade, link_Nemertes) {
    try {
        await client.connect();
        const database = client.db("users");
        const collection = database.collection("diplomatikes");

        const result = await collection.updateOne(
            { _id: id }, // Εύρεση της διπλωματικής με βάση το ID
            {
                $set: {
                    status: "Περατωμένη",
                    grade: grade,
                    link_Nemertes: link_Nemertes,
                },
            }
        );

        console.log(`✅ Ολοκληρώθηκε η διπλωματική με ID: ${id}`);
    } catch (error) {
        console.error("❌ Σφάλμα κατά την ολοκλήρωση:", error);
    } finally {
        await client.close();
    }
}

// Παράδειγμα χρήσης
async function main() {
    await all_diplomatikes(); // Φόρτωση δεδομένων από τη βάση και περίμενε να ολοκληρωθεί πριν κανεις υπολογισμούς
    calculateTimeSinceSubmission(); // Υπολογισμός χρόνου από την ημερομηνία υποβολής

    // Ενημέρωση κατάστασης σε "Ενεργή"
    await setActiveDiplomatiki("diplomatiki_id_1", "AP12345", "Πρακτικό Εξέτασης 2025");

    // Ακύρωση ανάθεσης θέματος
    await cancelDiplomatiki("diplomatiki_id_2", "GS2025", 2025, "Κατόπιν αίτησης φοιτητή");

    // Αλλαγή κατάστασης σε "Περατωμένη"
    await completeDiplomatiki("diplomatiki_id_3", 9.5, "https://nimerti.example.com/diplomatiki_id_3");
}

main();