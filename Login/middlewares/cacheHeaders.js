module.exports = (req, res, next) => {
  const url = req.url;

  // Αν είναι στατικό αρχείο (π.χ. εικόνα, JS, CSS), βάζω μεγάλο TTL
  if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
    res.setHeader("Cache-Control", "public, max-age=259200"); // 3 ημέρες
  } else {
    // Για dynamic routes βάζω μικρότερο TTL ή καθόλου
    res.setHeader("Cache-Control", "no-store");
  }

  next();
};
