const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages/:otherUserId - Get chat history with another user
router.get('/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ msg: 'Server error fetching chat history' });
  }
});

// POST /api/messages/send - Send a chat message with optional file attachment
router.post('/send', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId, text, attachmentUrl, attachmentName, attachmentType } = req.body;

    if (!recipientId || (!text && !attachmentUrl)) {
      return res.status(400).json({ msg: 'Recipient and message content/attachment are required' });
    }

    const newMessage = new Message({
      senderId,
      recipientId,
      text: (text || '').trim(),
      attachmentUrl: attachmentUrl || '',
      attachmentName: attachmentName || '',
      attachmentType: attachmentType || ''
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ msg: 'Server error sending message' });
  }
});

// PUT /api/messages/:id/edit - Edit a sent message
router.put('/:id/edit', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to edit this message' });
    }

    if (message.isDeleted) {
      return res.status(400).json({ msg: 'Cannot edit a deleted message' });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (err) {
    console.error('Error editing message:', err);
    res.status(500).json({ msg: 'Server error editing message' });
  }
});

// DELETE /api/messages/:id - Delete a message for everyone (WhatsApp style)
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to delete this message' });
    }

    message.isDeleted = true;
    message.text = 'This message was deleted';
    message.attachmentUrl = '';
    message.attachmentName = '';
    await message.save();

    res.json(message);
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ msg: 'Server error deleting message' });
  }
});

// POST /api/messages/:id/react - Toggle emoji reaction on a message
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    const userId = req.user.id;
    const existingIndex = message.reactions.findIndex(r => r.userId.toString() === userId && r.emoji === emoji);

    if (existingIndex > -1) {
      // Toggle off reaction if already reacted with same emoji
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    res.json(message);
  } catch (err) {
    console.error('Error reacting to message:', err);
    res.status(500).json({ msg: 'Server error reacting to message' });
  }
});

module.exports = router;
