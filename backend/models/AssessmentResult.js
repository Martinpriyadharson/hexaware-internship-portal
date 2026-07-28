const mongoose = require('mongoose');

const AssessmentResultSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  },
  assessmentName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 30
  },
  percentage: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'In Progress'],
    default: 'Completed'
  },
  answers: [{
    questionId: String,
    questionText: String,
    selectedOption: Number,
    correctOption: Number,
    options: [String],
    isCorrect: Boolean
  }],
  remarks: {
    type: String,
    default: ''
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AssessmentResult', AssessmentResultSchema);
