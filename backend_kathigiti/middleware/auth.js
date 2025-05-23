module.exports = (req, res, next) => {
  req.user = { id: req.params.profId || null, role: 'prof' };
  next();
};
