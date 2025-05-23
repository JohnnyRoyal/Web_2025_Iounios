const express = require('express');
const router = express.Router();
const controller = require('../controllers/profController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/:profId/topics', controller.getTopicsByProfessor);
router.post('/:profId/topics', controller.createTopic);

router.get('/:profId/invitations', controller.getInvitations);
router.post('/:profId/invitations/:diplId/accept', controller.acceptInvitation);
router.post('/:profId/invitations/:diplId/reject', controller.rejectInvitation);

router.get('/:profId/stats', controller.getStats);

router.get('/:profId/diplomas', controller.getDiplomasByStatus);
router.put('/:profId/diplomas/:diplId/status', controller.updateDiplomaStatus);

router.get('/:profId/participations', controller.getParticipatedDiplomas);

module.exports = router;
