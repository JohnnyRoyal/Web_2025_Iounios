const mongoose = require('mongoose');

const ProfSchema = new mongoose.Schema({
  username: String,
  password: String,
  arithmosMitroou: Number
});

module.exports = mongoose.model('Prof', ProfSchema);
