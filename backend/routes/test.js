const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

// @route   GET api/test/questions/:stack
// @desc    Get 30 randomized questions for a stack (excluding correct answers for security)
// @access  Private
router.get('/questions/:stack', auth, async (req, res) => {
  const { stack } = req.params;

  try {
    // Verify user profile is completed
    const user = await User.findById(req.user.id);
    if (!user || !user.isProfileCompleted) {
      return res.status(403).json({ msg: 'Profile incomplete. Please fill in all details before taking the test.' });
    }
    // Find all questions for the stack
    const questions = await Question.find({ stack });
    
    if (questions.length === 0) {
      return res.status(404).json({ msg: `No questions found for stack: ${stack}` });
    }

    // Fisher-Yates Shuffle
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Limit to 30 questions
    const selectedQuestions = shuffled.slice(0, 30);

    // Strip out correctAnswer index to prevent inspection-based cheating
    const safeQuestions = selectedQuestions.map(q => ({
      _id: q._id,
      stack: q.stack,
      questionText: q.questionText,
      options: q.options
    }));

    res.json(safeQuestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/test/submit
// @desc    Submit test answers, score them, and record the attempt
// @access  Private
router.post('/submit', auth, async (req, res) => {
  const { stack, answers } = req.body; // answers is an array of { questionId, answerIndex }

  try {
    // Verify user profile is completed
    const user = await User.findById(req.user.id);
    if (!user || !user.isProfileCompleted) {
      return res.status(403).json({ msg: 'Profile incomplete. Please fill in all details before submitting the test.' });
    }
    if (!stack || !Array.isArray(answers)) {
      return res.status(400).json({ msg: 'Invalid submission payload' });
    }

    let score = 0;
    const totalQuestions = answers.length;

    if (totalQuestions === 0) {
      return res.status(400).json({ msg: 'No answers submitted' });
    }

    // Evaluate answers
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (question) {
        // If user selected the correct answer index
        if (question.correctAnswer === ans.answerIndex) {
          score++;
        }
      }
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 75;

    // Save attempt in the database
    const attempt = new Attempt({
      userId: req.user.id,
      stack,
      score,
      totalQuestions,
      percentage,
      passed
    });

    await attempt.save();

    res.json({
      attemptId: attempt._id,
      score,
      totalQuestions,
      percentage,
      passed
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/test/attempts/latest
// @desc    Get candidate's latest test attempt
// @access  Private
router.get('/attempts/latest', auth, async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!attempt) {
      return res.json(null);
    }
    res.json(attempt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
