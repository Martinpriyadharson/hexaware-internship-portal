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
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
