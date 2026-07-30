const mongoose = require('mongoose');

const UserPresenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  currentStatus: {
    type: String,
    enum: ['Available', 'Busy', 'DND', 'BRB', 'Appear Away', 'Appear Offline', 'Offline'],
    default: 'Offline'
  },
  customStatus: {
    type: String,
    default: ''
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.models.UserPresence || mongoose.model('UserPresence', UserPresenceSchema);
