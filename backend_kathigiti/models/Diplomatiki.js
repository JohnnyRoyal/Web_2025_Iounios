const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiplomatikiSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  professor: { type: Schema.Types.ObjectId, ref: 'Prof', required: true },
  assignedStudent: { type: Schema.Types.ObjectId, ref: 'Student' },
  invitedProfessors: [{ type: Schema.Types.ObjectId, ref: 'Prof' }],
  acceptedProfessors: [{ type: Schema.Types.ObjectId, ref: 'Prof' }],
  status: {
    type: String,
    enum: ['open', 'assigned', 'committee', 'completed'],
    default: 'open'
  }
});

module.exports = mongoose.model('Diplomatiki', DiplomatikiSchema);
