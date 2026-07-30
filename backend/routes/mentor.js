const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const mentorController = require('../controllers/mentorController');

// All endpoints in this file are protected by JWT auth
router.use(auth);

// @route   GET /api/mentor/my-mentor
// @desc    Candidate gets their assigned mentor's details (accessible by Candidate role)
router.get('/my-mentor', roleAuth(['Candidate', 'Mentor', 'Admin']), async (req, res) => {
  try {
    const User = require('../models/User');
    const candidate = await User.findById(req.user.id)
      .populate('assignedMentorId', 'name email designation department role');
    if (!candidate || !candidate.assignedMentorId) {
      return res.status(404).json({ msg: 'No mentor assigned yet' });
    }
    res.json(candidate.assignedMentorId);
  } catch (err) {
    console.error('Error fetching assigned mentor:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Notifications routes (accessible by Mentor, Admin, and Candidate)
router.get('/notifications', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.getNotifications);
router.put('/notifications/read', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.markAllNotificationsRead);
router.put('/notifications/:id/read', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.markNotificationRead);
router.delete('/notifications/:id', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.deleteNotification);

// Endpoints below this line are restricted to Mentor & Admin roles only
router.use(roleAuth(['Mentor', 'Admin']));

// @route   GET /api/mentor/dashboard
router.get('/dashboard', mentorController.getDashboardData);

// @route   GET /api/mentor/candidates
router.get('/candidates', mentorController.getCandidates);

// @route   GET /api/mentor/results
router.get('/results', mentorController.getResults);
router.delete('/results/:id', mentorController.deleteResult);

// @route   GET /api/mentor/statistics
router.get('/statistics', mentorController.getStatistics);

// @route   GET & PUT /api/mentor/profile
router.get('/profile', mentorController.getProfile);
router.put('/profile', mentorController.updateProfile);

// @route   GET /api/mentor/reports
router.get('/reports', mentorController.getReports);
router.post('/reports/generate', mentorController.generateReport);

// @route   POST /api/mentor/assign
router.post('/assign', mentorController.assignAssessment);

// @route   POST /api/mentor/evaluate
router.post('/evaluate', mentorController.evaluateAssessment);

module.exports = router;
