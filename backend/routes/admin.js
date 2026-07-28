const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const adminController = require('../controllers/adminController');

// All endpoints in this file require JWT Auth & Admin/Mentor Role
router.use(auth);

// @route   GET /api/admin/overview
router.get('/overview', adminController.getOverview);

// @route   PUT /api/admin/allocate-mentor
router.put('/allocate-mentor', adminController.allocateMentor);

// @route   POST /api/admin/create-mentor
router.post('/create-mentor', adminController.createMentor);

module.exports = router;
