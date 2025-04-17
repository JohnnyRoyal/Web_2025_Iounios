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
// Εκτέλεση της κύριας συνάρτησης
async function main() {
    await cancelDiplomatiki();
}

main(); // Εκτέλεση της κύριας συνάρτησης