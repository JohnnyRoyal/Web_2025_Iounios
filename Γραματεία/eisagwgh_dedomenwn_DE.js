const { MongoClient } = require("mongodb");

// Ορισμός connection URI (MongoDB τοπικά)
const uri = "mongodb://localhost:27017";

// Δημιουργία client
const client = new MongoClient(uri);

/* Example JSON data for students and professors

 students = [
    {
        id: "1",
        name: "Makis",
        surname: "Makopoulos",
        student_number: "10433999",
        street: "test street",
        number: "45",
        city: "test city",
        postcode: "39955",
        father_name: "Orestis",
        landline_telephone: "2610333000",
        mobile_telephone: "6939096979",
        email: "10433999@students.upatras.gr"
    }
];

 professors = [
    {
        id: "1",
        name: "Andreas",
        surname: "Komninos",
        email: "akomninos@ceid.upatras.gr",
        topic: "Network-centric systems",
        landline: "2610996915",
        mobile: "6977998877",
        department: "CEID",
        university: "University of Patras"
    }
];
*/

//Το fs είναι το file system module του Node.js που επιτρέπει την ανάγνωση και εγγραφή αρχείων
// Χρησιμοποιείται για να διαβάσουμε τα JSON αρχεία που περιέχουν τα δεδομένα των φοιτητών και καθηγητών
//To require είναι μια εντολή του Node.js που χρησιμοποιείται για να εισάγουμε modules ή αρχεία
// Στην προκειμένη περίπτωση, χρησιμοποιούμε το require για να εισάγουμε το fs module για να επεξεργαστούμε τα JSON αρχεία

const fs = require("fs");

// Το fs.readFileSync διαβάζει το αρχείο students.json και professors.json και επιστρέφει το περιεχόμενο του αρχείου ως string
// Το "utf8" είναι η κωδικοποίηση που χρησιμοποιείται για να διαβάσουμε το αρχείο ως κείμενο και το students.json και professors.json είναι τα ονόματα των αρχείων που περιέχουν τα δεδομένα των φοιτητών και καθηγητών αντίστοιχα
// Το fs.readFileSync είναι μια συγχρονισμένη μέθοδος, πράγμα που σημαίνει ότι θα περιμένει να ολοκληρωθεί η ανάγνωση του αρχείου πριν προχωρήσει στην επόμενη γραμμή κώδικα
// Το JSON.parse μετατρέπει το string σε JavaScript αντικείμενο, το κάνει πίνακα
//Αν η fs.readFIleSync επιστρεψει το string '[{"id":"1","name":"Makis","surname":"Makopoulos","student_number":"10433999"}]'
//H json.parse θα το κάνει σε ενα πίνακα javsascript αντικειμένων
/*
[
    {
        id: "1",
        name: "Makis",
        surname: "Makopoulos",
        student_number: "10433999"
    }
]
*/

const students = JSON.parse(fs.readFileSync("students.json", "utf8")); // Να προσέξω path
const professors = JSON.parse(fs.readFileSync("professors.json", "utf8"));

// Ασυγχρονη συνάρτηση για την εισαγωγή δεδομένων
async function eisagwgh_dedomenwn() {
    try {
        // Σύνδεση στη βάση δεδομένων
        await client.connect();
        console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB!");

        // Επιλογή βάσης δεδομένων και συλλογών
        const database = client.db("users"); // Όνομα βάσης
        const studentsCollection = database.collection("students"); // Συλλογή για φοιτητές
        const professorsCollection = database.collection("professors"); // Συλλογή για καθηγητές

        // Εισαγωγή δεδομένων φοιτητών
        if (students.length > 0) {
            const studentResult = await studentsCollection.insertMany(students);
            console.log(`✅ Εισήχθησαν ${studentResult.insertedCount} φοιτητές.`);
        }

        // Εισαγωγή δεδομένων καθηγητών
        if (professors.length > 0) {
            const professorResult = await professorsCollection.insertMany(professors);
            console.log(`✅ Εισήχθησαν ${professorResult.insertedCount} καθηγητές.`);
        }
    } catch (error) {
        console.error("❌ Σφάλμα κατά την εισαγωγή δεδομένων:", error);
    } finally {
        // Κλείσιμο σύνδεσης
        await client.close();
        console.log("🔌 Σύνδεση στη MongoDB έκλεισε.");
    }
}

// Εκτέλεση της κύριας συνάρτησης
async function main() {
    await eisagwgh_dedomenwn();
}

main(); // Εκτέλεση της κύριας συνάρτησης