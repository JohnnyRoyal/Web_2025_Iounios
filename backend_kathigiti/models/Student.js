const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  taxydromikiDieythinsi: String,
  kinito: String,
  stathero: String,
  titlosDiplomatikis: String,
  arithmosMitroou: Number,
  onoma: String,
  epitheto: String,
  katastasiFoititi: String,
  imerominiaOraExetasis: Date,
  troposExetasis: String,
  aithousaExetasis: String,
  syndesmosExetasis: String,
  assignedDiploma: { type: mongoose.Schema.Types.ObjectId, ref: 'Diplomatiki' }
});

module.exports = mongoose.model('Student', StudentSchema);
