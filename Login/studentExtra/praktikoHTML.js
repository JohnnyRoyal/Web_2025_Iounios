function generatePraktikoHTML(diploma) {
    const { foititis, trimeriEpitropi, mainKathigitis } = diploma;
    const dateStr = diploma.anakoinosiExetasis || "—";
  
    const gradesHTML = trimeriEpitropi.map(member => `
      <li>${member.onoma} ${member.epitheto}: ${member.vathmos ?? "—"}</li>
    `).join("");
  
    const avg = diploma.telikosVathmos ?? "—";
  
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="text-align:center;">ΠΡΑΚΤΙΚΟ ΕΞΕΤΑΣΗΣ ΔΙΠΛΩΜΑΤΙΚΗΣ ΕΡΓΑΣΙΑΣ</h2>
        <p>Ο φοιτητής/η φοιτήτρια <strong>${foititis.onoma} ${foititis.epitheto}</strong>, με Αριθμό Μητρώου <strong>${foititis.arithmosMitrou}</strong>, παρουσίασε τη διπλωματική εργασία με τίτλο <em>"${diploma.titlos}"</em>.</p>
        <p>Η εξέταση έλαβε χώρα: <strong>${dateStr}</strong></p>
  
        <h3>Βαθμολογία Επιτροπής:</h3>
        <ul>${gradesHTML}</ul>
  
        <p><strong>Μέσος Όρος:</strong> ${avg}</p>
        <br/>
        <p style="text-align:right;">Ο Επιβλέπων Καθηγητής: ${mainKathigitis.onoma} ${mainKathigitis.epitheto}</p>
      </div>
    `;
  }
  