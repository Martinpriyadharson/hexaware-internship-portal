const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Candidate', 'Mentor', 'Admin'],
    default: 'Candidate',
  },
  college: {
    type: String,
    default: '',
  },
  university: {
    type: String,
    default: '',
  },
  degree: {
    type: String,
    default: '',
  },
  branch: {
    type: String,
    default: '',
  },
  currentYear: {
    type: String,
    default: '',
  },
  graduationYear: {
    type: String,
    default: '',
  },
  cgpa: {
    type: String,
    default: '',
  },
  dob: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  mobile: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  isDeclarationConfirmed: {
    type: Boolean,
    default: false,
  },
  preferredStack: {
    type: String,
    default: '',
  },
  internshipDuration: {
    type: String,
    default: '3 Months',
  },
  internshipStartDate: {
    type: Date,
    default: Date.now,
  },
  internshipEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  resumeName: {
    type: String,
    default: '',
  },
  linkedinUrl: {
    type: String,
    default: '',
  },
  githubUrl: {
    type: String,
    default: '',
  },
  skills: {
    type: String,
    default: '',
  },
  certifications: {
    type: String,
    default: '',
  },
  preferredLocation: {
    type: String,
    default: '',
  },
  activeBacklogs: {
    type: String,
    default: '0',
  },
  emergencyContact: {
    type: String,
    default: '',
  },
  languagesKnown: {
    type: String,
    default: '',
  },
  assignedMentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  hasAttemptedAssessment: {
    type: Boolean,
    default: false,
  },
  hasPassedAssessment: {
    type: Boolean,
    default: false,
  },
  attemptedStack: {
    type: String,
    default: '',
  },
  isAssessmentSubmitted: {
    type: Boolean,
    default: false,
  },
  assessmentScore: {
    type: Number,
    default: 0,
  },
  assessmentPercentage: {
    type: Number,
    default: 0,
  },
  assessmentStatus: {
    type: String,
    enum: ['Pending Assessment', 'Passed - Pending Submission', 'Pending Mentor Allocation', 'Mentor Allocated', 'Not Shortlisted'],
    default: 'Pending Assessment',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
