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

// Εκτέλεση της κύριας συνάρτησης
async function main() {
    await completeDiplomatiki();
}

main(); // Εκτέλεση της κύριας συνάρτησης