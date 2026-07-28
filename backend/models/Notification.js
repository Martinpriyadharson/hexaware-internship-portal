const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'AssessmentPassed',
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  candidateName: {
    type: String,
    default: '',
  },
  candidateEmail: {
    type: String,
    default: '',
  },
  stack: {
    type: String,
    default: '',
  },
  percentage: {
    type: Number,
    default: 0,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
