const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Δεν είστε συνδεδεμένος" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "MY_SECRET_KEY"); // ίδιο key με το login
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Μη έγκυρο token" });
  }
};

module.exports = authMiddleware;
