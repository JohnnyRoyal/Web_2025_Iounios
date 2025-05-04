const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Δεν είστε συνδεδεμένος" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "MY_SECRET_KEY"); // Χρησιμοποίησε το ίδιο SECRET_KEY που χρησιμοποιείς στο login
    console.log("Decoded Token:", decoded); // Εμφανίζει το περιεχόμενο του token
    req.user = decoded; // Αποθηκεύει τα δεδομένα του χρήστη στο req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Μη έγκυρο token" });
  }
};

module.exports = authMiddleware;


//Παραδείγματα χρήσης του middleware σε routes
/*
router.get("/student-only", authMiddleware, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Μόνο φοιτητές έχουν πρόσβαση εδώ." });
  }
  res.json({ message: "Καλωσήρθατε, φοιτητή!" });
});

router.get("/secretary-only", authMiddleware, (req, res) => {
  if (req.user.role !== "secretary") {
    return res.status(403).json({ message: "Μόνο η γραμματεία έχει πρόσβαση εδώ." });
  }
  res.json({ message: "Καλωσήρθατε, γραμματεία!" });
});

*/