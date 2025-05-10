const handleSetAP = async (id) => {
    const protocolNumber = prompt("Εισάγετε τον αριθμό πρωτοκόλλου:");
    if (!protocolNumber) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/secretary/set-ap",
        { id, protocolNumber },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      alert("✅ Ο αριθμός πρωτοκόλλου καταχωρήθηκε επιτυχώς!");
    } catch (err) {
      console.error(err);
      alert("❌ Σφάλμα κατά την καταχώρηση του αριθμού πρωτοκόλλου.");
    }
  };