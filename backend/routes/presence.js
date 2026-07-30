const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserPresence = require('../models/UserPresence');
const User = require('../models/User');

// All presence endpoints require JWT authentication
router.use(auth);

// @route   GET /api/presence/:userId
// @desc    Get user presence state, status, custom message, and last active timestamp
router.get('/user/:userId', async (req, res) => {
  try {
    let presence = await UserPresence.findOne({ userId: req.params.userId });
    if (!presence) {
      presence = await UserPresence.create({
        userId: req.params.userId,
        currentStatus: 'Offline',
        isOnline: false,
        lastSeen: new Date()
      });
    }
    res.json(presence);
  } catch (err) {
    console.error('Error fetching presence:', err);
    res.status(500).json({ msg: 'Server error loading user presence' });
  }
});

// @route   PUT /api/presence/status
// @desc    Update current status (Available, Busy, DND, BRB, Appear Away, Appear Offline) & custom status
router.put('/status', async (req, res) => {
  const { currentStatus, customStatus } = req.body;
  try {
    const validStatuses = ['Available', 'Busy', 'DND', 'BRB', 'Appear Away', 'Appear Offline', 'Offline'];
    if (currentStatus && !validStatuses.includes(currentStatus)) {
      return res.status(400).json({ msg: 'Invalid presence status' });
    }

    const updateFields = {
      lastActivity: new Date(),
      lastSeen: new Date()
    };
    if (currentStatus) updateFields.currentStatus = currentStatus;
    if (customStatus !== undefined) updateFields.customStatus = customStatus;
    if (currentStatus === 'Offline') updateFields.isOnline = false;

    const presence = await UserPresence.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    // Broadcast status change via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.emit('presence:update', {
        userId: req.user.id,
        currentStatus: presence.currentStatus,
        customStatus: presence.customStatus,
        lastSeen: presence.lastSeen,
        isOnline: presence.isOnline
      });
    }

    res.json(presence);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ msg: 'Server error updating status' });
  }
});

// @route   GET /api/presence/online
// @desc    Get online statuses map for all users or assigned users
router.get('/online', async (req, res) => {
  try {
    const presences = await UserPresence.find({})
      .populate('userId', 'name email role assignedMentorId');

    const statusMap = {};
    presences.forEach(p => {
      if (p.userId) {
        statusMap[p.userId._id] = {
          currentStatus: p.currentStatus,
          customStatus: p.customStatus,
          isOnline: p.isOnline,
          lastSeen: p.lastSeen
        };
      }
    });

    res.json(statusMap);
  } catch (err) {
    console.error('Error fetching online users map:', err);
    res.status(500).json({ msg: 'Server error loading online presence' });
  }
});

// @route   GET /api/presence/last-seen
// @desc    Get last-seen timestamps for users
router.get('/last-seen', async (req, res) => {
  try {
    const presences = await UserPresence.find({}).select('userId lastSeen currentStatus isOnline');
    res.json(presences);
  } catch (err) {
    console.error('Error fetching last seen:', err);
    res.status(500).json({ msg: 'Server error loading last seen data' });
  }
});

module.exports = router;
