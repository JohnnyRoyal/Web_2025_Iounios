const Diplomatiki = require('../models/Diplomatiki');
const Student = require('../models/Student');

exports.getTopicsByProfessor = async (req, res, next) => {
  try {
    const topics = await Diplomatiki.find({ professor: req.params.profId });
    res.json(topics);
  } catch (err) {
    next(err);
  }
};

exports.createTopic = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const topic = new Diplomatiki({ title, description, professor: req.params.profId });
    const saved = await topic.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

exports.getInvitations = async (req, res, next) => {
  try {
    const invites = await Diplomatiki.find({ invitedProfessors: req.params.profId });
    res.json(invites);
  } catch (err) {
    next(err);
  }
};

exports.acceptInvitation = async (req, res, next) => {
  try {
    await Diplomatiki.findByIdAndUpdate(
      req.params.diplId,
      {
        $pull: { invitedProfessors: req.params.profId },
        $push: { acceptedProfessors: req.params.profId }
      }
    );
    res.json({ message: 'Invitation accepted.' });
  } catch (err) {
    next(err);
  }
};

exports.rejectInvitation = async (req, res, next) => {
  try {
    await Diplomatiki.findByIdAndUpdate(
      req.params.diplId,
      { $pull: { invitedProfessors: req.params.profId } }
    );
    res.json({ message: 'Invitation rejected.' });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const profId = req.params.profId;
    const totalTopics = await Diplomatiki.countDocuments({ professor: profId });
    const totalAssigned = await Diplomatiki.countDocuments({ professor: profId, status: 'assigned' });
    const totalCompleted = await Diplomatiki.countDocuments({ professor: profId, status: 'completed' });
    const invitesPending = await Diplomatiki.countDocuments({ invitedProfessors: profId });
    res.json({ totalTopics, totalAssigned, totalCompleted, invitesPending });
  } catch (err) {
    next(err);
  }
};

exports.getDiplomasByStatus = async (req, res, next) => {
  try {
    const profId = req.params.profId;
    const status = req.query.status;
    const query = { professor: profId };
    if (status) query.status = status;
    const diplomas = await Diplomatiki.find(query);
    res.json(diplomas);
  } catch (err) {
    next(err);
  }
};

exports.updateDiplomaStatus = async (req, res, next) => {
  try {
    const updated = await Diplomatiki.findByIdAndUpdate(
      req.params.diplId,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.getParticipatedDiplomas = async (req, res, next) => {
  try {
    const profId = req.params.profId;
    const diplomas = await Diplomatiki.find({
      $or: [
        { professor: profId },
        { acceptedProfessors: profId }
      ]
    });
    res.json(diplomas);
  } catch (err) {
    next(err);
  }
};
