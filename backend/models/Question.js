const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  stack: {
    type: String,
    required: true,
    index: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [array => array.length === 4, 'Must have exactly 4 choices'],
  },
  correctAnswer: {
    type: Number, // index 0-3
    required: true,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
