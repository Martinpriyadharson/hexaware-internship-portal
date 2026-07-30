const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

const UNDO_WINDOW_MS = 5 * 1000;   // 5 seconds undo window
const EDIT_LIMIT_MS  = 15 * 60 * 1000; // 15 minutes
const DEL_LIMIT_MS   = 30 * 60 * 1000; // 30 minutes

// ── Helper: broadcast message event via Socket.IO ─────────────────────────
function broadcast(req, event, payload) {
  const io = req.app.get('io');
  if (!io) return;
  const recipients = [String(payload.senderId?._id || payload.senderId), String(payload.recipientId?._id || payload.recipientId)];
  recipients.forEach(rid => io.to(rid).emit(event, payload));
}

// @route   GET /api/messages/unread/counts
// @desc    Get unread message counts per sender
router.get('/unread/counts', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const unread = await Message.aggregate([
      { $match: { recipientId: new mongoose.Types.ObjectId(req.user.id), status: { $ne: 'seen' } } },
      { $group: { _id: '$senderId', count: { $sum: 1 } } }
    ]);
    const map = {};
    unread.forEach(item => {
      map[String(item._id)] = item.count;
    });
    res.json(map);
  } catch (err) {
    console.error('Error fetching unread counts:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/messages/last-messages
// @desc    Get latest message snippet for each conversation of the current user
router.get('/last-messages', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const myId = new mongoose.Types.ObjectId(req.user.id);

    const latestMsgs = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: myId }, { recipientId: myId }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', myId] },
              '$recipientId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    const map = {};
    latestMsgs.forEach(item => {
      const otherId = String(item._id);
      const msg = item.lastMessage;
      const msgTime = new Date(msg.createdAt);
      const timeStr = msgTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const snippet = msg.text || (msg.attachmentName ? `📎 ${msg.attachmentName}` : msg.audioUrl ? '🎙️ Voice note' : 'Message');
      
      map[otherId] = {
        text: snippet,
        time: timeStr,
        timestamp: msgTime.getTime()
      };
    });

    res.json(map);
  } catch (err) {
    console.error('Error fetching last messages:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/messages/contacts
// @desc    Get eligible contacts for chat based on role & message history
router.get('/contacts', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const userId = req.user.id;
    const userRole = req.user.role;

    let contacts = [];

    // Find all Admins
    const admins = await User.find({ role: 'Admin' }, '_id name email role avatar designation preferredStack').lean();

    if (userRole === 'Candidate') {
      const candidateUser = await User.findById(userId).populate('assignedMentorId', '_id name email role avatar designation preferredStack').lean();
      let mentor = candidateUser?.assignedMentorId;
      
      if (mentor) {
        contacts.push({ ...mentor, _id: String(mentor._id || mentor.id), role: 'Mentor' });
      } else {
        const allMentors = await User.find({ role: 'Mentor' }, '_id name email role avatar designation preferredStack').lean();
        allMentors.forEach(m => contacts.push({ ...m, _id: String(m._id), role: 'Mentor' }));
      }

      // Add Admins to candidate's contacts list
      admins.forEach(adm => {
        if (String(adm._id) !== String(userId)) {
          contacts.push({ ...adm, _id: String(adm._id), role: 'Admin' });
        }
      });
    } else if (userRole === 'Mentor') {
      const mongoose = require('mongoose');
      let userObjId;
      try { userObjId = new mongoose.Types.ObjectId(userId); } catch (e) {}

      const candidateQuery = userObjId 
        ? { $or: [{ assignedMentorId: userId }, { assignedMentorId: userObjId }], role: 'Candidate' }
        : { assignedMentorId: userId, role: 'Candidate' };

      let candidates = await User.find(candidateQuery, '_id name email role avatar preferredStack department').lean();
      if (candidates.length === 0) {
        candidates = await User.find({ role: 'Candidate' }, '_id name email role avatar preferredStack department').lean();
      }

      candidates.forEach(c => {
        contacts.push({ ...c, _id: String(c._id), role: 'Candidate' });
      });

      // Add Admins to mentor's contacts list
      admins.forEach(adm => {
        if (String(adm._id) !== String(userId)) {
          contacts.push({ ...adm, _id: String(adm._id), role: 'Admin' });
        }
      });
    } else if (userRole === 'Admin') {
      const mentors = await User.find({ role: 'Mentor' }, '_id name email role avatar designation preferredStack').lean();
      const candidates = await User.find({ role: 'Candidate' }, '_id name email role avatar preferredStack department').lean();

      mentors.forEach(m => contacts.push({ ...m, _id: String(m._id), role: 'Mentor' }));
      candidates.forEach(c => contacts.push({ ...c, _id: String(c._id), role: 'Candidate' }));
    }

    // Include any users with whom this user has prior message history
    const historySenderIds = await Message.find({ recipientId: userId }).distinct('senderId');
    const historyRecipientIds = await Message.find({ senderId: userId }).distinct('recipientId');
    const historyUserIds = Array.from(new Set([...historySenderIds.map(String), ...historyRecipientIds.map(String)]));

    const existingContactIds = new Set(contacts.map(c => String(c._id)));
    const missingIds = historyUserIds.filter(id => id !== String(userId) && !existingContactIds.has(id));

    if (missingIds.length > 0) {
      const missingUsers = await User.find({ _id: { $in: missingIds } }, '_id name email role avatar designation preferredStack department').lean();
      missingUsers.forEach(u => {
        contacts.push({ ...u, _id: String(u._id) });
      });
    }

    res.json(contacts);
  } catch (err) {
    console.error('Error fetching chat contacts:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/:otherUserId  — fetch chat history
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId,   recipientId: currentUserId }
      ]
    })
    .populate('replyToId', 'text senderId attachmentName codeSnippet audioUrl')
    .sort({ createdAt: 1 });

    // Auto mark incoming as seen
    await Message.updateMany(
      { senderId: otherUserId, recipientId: currentUserId, status: { $ne: 'seen' } },
      { $set: { status: 'seen', seenAt: new Date(), isRead: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ msg: 'Server error fetching chat history' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages/send
// ─────────────────────────────────────────────────────────────────────────────
router.post('/send', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const {
      recipientId, text, attachmentUrl, attachmentName, attachmentType, attachmentSize,
      audioUrl, audioDuration, codeSnippet, codeLanguage, replyToId
    } = req.body;

    if (!recipientId || (!text && !attachmentUrl && !audioUrl && !codeSnippet)) {
      return res.status(400).json({ msg: 'Recipient and message content are required' });
    }

    const msg = new Message({
      senderId,
      recipientId,
      text: (text || '').trim(),
      attachmentUrl: attachmentUrl || '',
      attachmentName: attachmentName || '',
      attachmentType: attachmentType || '',
      attachmentSize: attachmentSize || 0,
      audioUrl: audioUrl || '',
      audioDuration: audioDuration || 0,
      codeSnippet: codeSnippet || '',
      codeLanguage: codeLanguage || 'javascript',
      replyToId: replyToId || null,
      status: 'delivered',
      deliveredAt: new Date(),
      auditLog: [{ action: 'edit', performedBy: senderId, meta: { note: 'Initial send' } }]
    });

    await msg.save();

    const User = require('../models/User');
    const Notification = require('../models/Notification');

    const senderUser = await User.findById(senderId).select('name email role');

    const populated = await Message.findById(msg._id)
      .populate('senderId', 'name email role')
      .populate('replyToId', 'text senderId attachmentName audioUrl');

    // Create system notification for recipient
    try {
      const notifSnippet = text || (attachmentName ? `📎 ${attachmentName}` : audioUrl ? '🎙️ Voice note' : 'New message');
      const newNotif = new Notification({
        userId: recipientId,
        title: `New Message from ${senderUser ? senderUser.name : 'User'}`,
        message: notifSnippet,
        type: 'ChatMessage',
        candidateId: senderId,
        candidateName: senderUser ? senderUser.name : '',
        candidateEmail: senderUser ? senderUser.email : ''
      });
      await newNotif.save();

      const io = req.app.get('io');
      if (io) {
        io.to(String(recipientId)).emit('notification:new', newNotif);
      }
    } catch (notifErr) {
      console.error('Error creating chat notification:', notifErr);
    }

    const io = req.app.get('io');
    if (io) {
      io.to(String(recipientId)).emit('message:received', populated.toObject());
    }
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ msg: 'Server error sending message' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/messages/:id/edit   (server-side 15-min enforcement)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/edit', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ msg: 'New text is required' });

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (message.senderId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Unauthorized to edit this message' });
    if (message.deletedForEveryone)
      return res.status(400).json({ msg: 'Cannot edit a deleted message' });

    // Server-side time limit enforcement
    if (!message.canEdit()) {
      return res.status(403).json({
        msg: 'Edit window has expired (15 minutes)',
        code: 'EDIT_WINDOW_EXPIRED'
      });
    }

    // Save pre-edit snapshot for undo
    const preSnapshot = message.captureSnapshot();

    // Record edit history
    message.editHistory.push({ text: message.text, editedAt: new Date() });
    message.text = text.trim();

    // Set undo window
    message.undoSnapshot = preSnapshot;
    message.redoSnapshot  = null;
    message.undoExpiresAt = new Date(Date.now() + UNDO_WINDOW_MS);
    message.redoExpiresAt = null;

    // Audit log
    message.auditLog.push({
      action: 'edit',
      performedBy: req.user.id,
      meta: { prevText: preSnapshot.text, newText: message.text }
    });

    await message.save();

    const obj = message.toObject();
    // Attach lifecycle metadata for client
    obj._lifecycle = {
      canEdit: message.canEdit(),
      canDeleteForEveryone: message.canDeleteForEveryone(),
      canUndo: true,
      undoExpiresAt: message.undoExpiresAt,
      canRedo: false
    };

    broadcast(req, 'message:edited', obj);
    res.json(obj);
  } catch (err) {
    console.error('Error editing message:', err);
    res.status(500).json({ msg: 'Server error editing message' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/messages/:id/everyone   (server-side 30-min enforcement)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id/everyone', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (message.senderId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Unauthorized to delete this message' });

    // Server-side time limit enforcement
    if (!message.canDeleteForEveryone()) {
      return res.status(403).json({
        msg: 'Delete for Everyone window has expired (30 minutes)',
        code: 'DELETE_WINDOW_EXPIRED'
      });
    }

    // Save full pre-delete snapshot for undo
    const preSnapshot = message.captureSnapshot();

    message.undoSnapshot   = preSnapshot;
    message.redoSnapshot   = null;
    message.undoExpiresAt  = new Date(Date.now() + UNDO_WINDOW_MS);
    message.redoExpiresAt  = null;
    message.deletedForEveryone = true;
    message.text           = 'This message was deleted';
    message.attachmentUrl  = '';
    message.attachmentName = '';
    message.audioUrl       = '';
    message.codeSnippet    = '';

    message.auditLog.push({
      action: 'delete_everyone',
      performedBy: req.user.id,
      meta: { snapshot: { text: preSnapshot.text } }
    });

    await message.save();

    const obj = message.toObject();
    obj._lifecycle = {
      canEdit: false,
      canDeleteForEveryone: false,
      canUndo: true,
      undoExpiresAt: message.undoExpiresAt,
      canRedo: false
    };

    broadcast(req, 'message:deleted:everyone', obj);
    res.json(obj);
  } catch (err) {
    console.error('Error deleting message for everyone:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/messages/:id/me   (always available — soft hide for requester)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id/me', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });

    const userId = req.user.id;
    if (!message.deletedForMe.map(String).includes(userId)) {
      message.deletedForMe.push(userId);
    }

    message.auditLog.push({
      action: 'delete_me',
      performedBy: userId,
      meta: {}
    });

    await message.save();
    res.json({ _id: message._id, deletedForMe: message.deletedForMe });
  } catch (err) {
    console.error('Error deleting message for me:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages/:id/undo   (5-second server-enforced window)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/undo', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (message.senderId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Unauthorized' });

    if (!message.canUndo()) {
      return res.status(403).json({
        msg: 'Undo window has expired (5 seconds)',
        code: 'UNDO_WINDOW_EXPIRED'
      });
    }

    // Capture current state as redo snapshot before applying undo
    const currentSnapshot = message.captureSnapshot();
    const previousSnapshot = message.undoSnapshot;

    // Restore previous state
    message.applySnapshot(previousSnapshot);

    // Set up redo
    message.redoSnapshot  = currentSnapshot;
    message.redoExpiresAt = new Date(Date.now() + UNDO_WINDOW_MS);
    message.undoSnapshot  = null;
    message.undoExpiresAt = null;

    // Rollback last edit from editHistory
    if (message.editHistory.length > 0) {
      message.editHistory.pop();
    }

    message.auditLog.push({
      action: message.deletedForEveryone ? 'undo_delete' : 'undo_edit',
      performedBy: req.user.id,
      meta: { restoredText: previousSnapshot.text }
    });

    await message.save();

    const obj = message.toObject();
    obj._lifecycle = {
      canEdit: message.canEdit(),
      canDeleteForEveryone: message.canDeleteForEveryone(),
      canUndo: false,
      canRedo: true,
      redoExpiresAt: message.redoExpiresAt
    };

    broadcast(req, 'message:undone', obj);
    res.json(obj);
  } catch (err) {
    console.error('Error undoing message action:', err);
    res.status(500).json({ msg: 'Server error undoing action' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages/:id/redo   (5-second server-enforced window after undo)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/redo', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (message.senderId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Unauthorized' });

    if (!message.canRedo()) {
      return res.status(403).json({
        msg: 'Redo window has expired (5 seconds)',
        code: 'REDO_WINDOW_EXPIRED'
      });
    }

    const redoSnapshot = message.redoSnapshot;
    const preRedoSnapshot = message.captureSnapshot();

    message.applySnapshot(redoSnapshot);

    // Re-add the edit record
    message.editHistory.push({ text: preRedoSnapshot.text, editedAt: new Date() });

    // Clear redo; allow one more undo for this redo action
    message.undoSnapshot  = preRedoSnapshot;
    message.undoExpiresAt = new Date(Date.now() + UNDO_WINDOW_MS);
    message.redoSnapshot  = null;
    message.redoExpiresAt = null;

    message.auditLog.push({
      action: 'redo_edit',
      performedBy: req.user.id,
      meta: { redoneText: redoSnapshot.text }
    });

    await message.save();

    const obj = message.toObject();
    obj._lifecycle = {
      canEdit: message.canEdit(),
      canDeleteForEveryone: message.canDeleteForEveryone(),
      canUndo: true,
      undoExpiresAt: message.undoExpiresAt,
      canRedo: false
    };

    broadcast(req, 'message:redone', obj);
    res.json(obj);
  } catch (err) {
    console.error('Error redoing message action:', err);
    res.status(500).json({ msg: 'Server error redoing action' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/messages/:id/pin
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/pin', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    message.isPinned = !message.isPinned;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error pinning message' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/messages/:id/star
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/star', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    const userId = req.user.id;
    const idx = message.isStarred.map(String).indexOf(userId);
    if (idx > -1) message.isStarred.splice(idx, 1);
    else message.isStarred.push(userId);
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error starring message' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages/:id/react
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    const userId = req.user.id;
    const existing = message.reactions.findIndex(r => r.userId.toString() === userId && r.emoji === emoji);
    if (existing > -1) message.reactions.splice(existing, 1);
    else message.reactions.push({ userId, emoji });
    await message.save();
    broadcast(req, 'message:reacted', message);
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error reacting to message' });
  }
});

module.exports = router;
