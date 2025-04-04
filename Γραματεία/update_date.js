const { MongoClient } = require("mongodb");

async function updateDates() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("users");
        const collection = database.collection("diplomatikes");

            //Filter documents που το πεδίο anathesh_date υπάρχει και είναι string
            // Εδώ χρησιμοποιούμε το $exists για να ελέγξουμε αν το πεδίο υπάρχει και το $type για να ελέγξουμε αν είναι string
            // Αν το πεδίο είναι undefined ή null, δεν θα το ενημερώσουμε
        const documents = await collection.find({ anathesh_date: { $exists: true, $type: "string" } }).toArray();

        for (const doc of documents) {
            const originalDate = doc.anathesh_date; // e.g., "8/3/2020"

            // Convert European-style date (DD/MM/YYYY) to ISO 8601 (YYYY-MM-DD)
            const [day, month, year] = originalDate.split("/");
            const isoDate = new Date(`${year}-${month}-${day}`); // Create a valid Date object

            // Update the document with the converted date
            await collection.updateOne(
                { _id: doc._id }, // Match the document by its unique _id
                { $set: { anathesh_date: isoDate } } // Set the new ISODate
            );
        }

        console.log("✅ Dates updated successfully!");
    } catch (error) {
        console.error("❌ Error updating documents:", error);
    } finally {
        await client.close();
    }
}

updateDates();