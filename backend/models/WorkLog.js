const mongoose = require('mongoose');

const WorkLogSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  taskName: {
    type: String,
    default: ''
  },
  taskDescription: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: ''
  },
  demoUrl: {
    type: String,
    default: ''
  },
  attachments: [{
    name: String,
    url: String,
    fileType: String
  }],
  mentorPrivateNotes: {
    type: String,
    default: ''
  },
  mentorNoteUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  mentorNoteUpdatedAt: {
    type: Date
  }
}, { timestamps: true });

WorkLogSchema.index({ candidateId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.WorkLog || mongoose.model('WorkLog', WorkLogSchema);
