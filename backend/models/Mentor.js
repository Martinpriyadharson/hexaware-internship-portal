const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  designation: {
    type: String,
    default: 'Senior Mentor & Evaluator'
  },
  department: {
    type: String,
    default: 'Technology & AI'
  },
  specialization: {
    type: String,
    default: 'Full Stack Development'
  },
  experience: {
    type: String,
    default: '8+ Years in Full Stack & Cloud Architecture'
  },
  skills: [{
    type: String
  }],
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MartinMentor'
  },
  assignedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mentor', MentorSchema);
