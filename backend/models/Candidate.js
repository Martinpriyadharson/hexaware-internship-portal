const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  photo: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering'
  },
  skills: [{
    type: String
  }],
  resumeUrl: {
    type: String,
    default: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  remarks: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
