const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const mentorController = require('../controllers/mentorController');

// All endpoints in this file are protected by JWT auth & Mentor role
router.use(auth);
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

// Notifications routes (accessible by Mentor, Admin, and Candidate)
router.get('/notifications', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.getNotifications);
router.put('/notifications/read', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.markAllNotificationsRead);
router.put('/notifications/:id/read', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.markNotificationRead);
router.delete('/notifications/:id', roleAuth(['Mentor', 'Admin', 'Candidate']), mentorController.deleteNotification);

module.exports = router;
