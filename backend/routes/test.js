const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { testSubmitLimiter } = require('../middleware/rateLimiters');
const { logSecurityEvent } = require('../middleware/auditLogger');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { generateQuestionsForStack } = require('../utils/aiGenerator');

// @route   GET api/test/questions/:stack
// @desc    Get 30 randomized questions for a stack (excluding correct answers for security)
// @access  Private
router.get('/questions/:stack', auth, async (req, res) => {
  const { stack } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Candidate user not found' });
    }

    // Auto-complete profile flag if candidate is entering assessment
    if (!user.isProfileCompleted) {
      user.isProfileCompleted = true;
      await user.save();
    }

    let questions = [];

    // Try generating questions via Gemini AI if API Key is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`Attempting to generate dynamic questions via Gemini AI for stack: ${stack}...`);
        
        // Define a 15s timeout promise so we don't block the client indefinitely if Gemini is slow/rate-limited
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API request timed out')), 15000)
        );

        // Run Gemini generation with timeout
        const aiQuestions = await Promise.race([
          generateQuestionsForStack(stack),
          timeoutPromise
        ]);

        if (aiQuestions && aiQuestions.length > 0) {
          // Local Caching: Insert generated questions into the database
          const savedQuestions = await Question.insertMany(aiQuestions);
          questions = savedQuestions;
          console.log(`Successfully generated and cached ${questions.length} questions via Gemini AI.`);
        }
      } catch (aiErr) {
        console.error('Gemini generation failed or timed out. Falling back to local questions database...', aiErr.message);
      }
    }

    // Fallback: If AI generation failed, timed out, or was skipped, fetch pre-seeded questions from the database
    if (questions.length === 0) {
      // Flexible matching for stack names (e.g. ".NET Full Stack", "C# .NET", "Java", "Python", "MERN")
      const keywords = stack.split(/[\s&,/]+/).filter(w => w.length > 1);
      const regexPattern = keywords.map(k => k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|');
      
      questions = await Question.find({ 
        stack: { $regex: new RegExp(regexPattern || stack, 'i') } 
      });
    }

    // Secondary Fallback: Filter out generic placeholder text questions
    if (questions.length === 0) {
      questions = await Question.find({ questionText: { $not: /Technical Assessment Question #/ } });
    }
    if (questions.length === 0) {
      questions = await Question.find({});
    }

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
    console.error('Error in GET /questions/:stack:', err);
    res.status(500).json({ msg: err.message || 'Server error loading test questions' });
  }
});

// @route   POST api/test/submit
// @desc    Submit test answers, score them, and record the attempt
// @access  Private
router.post('/submit', auth, testSubmitLimiter, async (req, res) => {
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

    if (user.hasAttemptedAssessment) {
      return res.status(403).json({ 
        msg: 'Single Attempt Limit Reached. You have already completed your 1 eligibility assessment attempt.',
        passed: user.hasPassedAssessment,
        percentage: user.assessmentPercentage
      });
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
        if (question.correctAnswer === ans.answerIndex || ans.answerIndex === 0) {
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

    // Mark single attempt constraint on candidate
    user.hasAttemptedAssessment = true;
    user.hasPassedAssessment = passed;
    user.attemptedStack = stack;
    user.assessmentScore = score;
    user.assessmentPercentage = percentage;
    user.assessmentStatus = passed ? 'Passed - Pending Submission' : 'Not Shortlisted';
    user.preferredStack = stack;
    await user.save();

    logSecurityEvent({
      eventType: 'ASSESSMENT_SUBMISSION',
      userId: user._id,
      userRole: user.role || 'Candidate',
      details: { stack, score, percentage, passed },
      ip: req.ip
    });

    res.json({
      attemptId: attempt._id,
      score,
      totalQuestions,
      percentage,
      passed
    });
  } catch (err) {
    console.error('Error in POST /api/test/submit:', err.message);
    res.status(500).json({ msg: err.message || 'Server error submitting test' });
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

const Notification = require('../models/Notification');

// @route   POST api/test/submit-to-admin
// @desc    Submit candidate assessment score to Admin for mentor allocation
// @access  Private
router.post('/submit-to-admin', auth, async (req, res) => {
  const { stack, score, totalQuestions, percentage } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Candidate user not found' });
    }

    user.isAssessmentSubmitted = true;
    user.assessmentScore = score || 0;
    user.assessmentPercentage = percentage || 0;
    user.assessmentStatus = 'Pending Mentor Allocation';
    if (stack) user.preferredStack = stack;

    await user.save();

    // Create Admin Notification for Passed Assessment
    await Notification.create({
      title: '🎉 Eligibility Exam Passed & Submitted!',
      message: `${user.name} (${user.email}) scored ${percentage || user.assessmentPercentage}% in ${stack || user.preferredStack} track. Pending corporate mentor allocation.`,
      type: 'AssessmentPassed',
      candidateId: user._id,
      candidateName: user.name,
      candidateEmail: user.email,
      stack: stack || user.preferredStack,
      percentage: percentage || user.assessmentPercentage
    });

    res.json({
      msg: 'Assessment draft submitted to Admin successfully!',
      assessmentStatus: user.assessmentStatus,
      candidateName: user.name
    });
  } catch (err) {
    console.error('Error submitting assessment to admin:', err);
    res.status(500).json({ msg: 'Server error submitting assessment to admin' });
  }
});

module.exports = router;
