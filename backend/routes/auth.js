const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    if (email.toLowerCase().endsWith('@hexaware.com')) {
      return res.status(400).json({ 
        msg: 'Corporate mentor accounts (@hexaware.com) cannot be self-registered. Please switch to Sign In.' 
      });
    }

    user = new User({
      name,
      email,
      password,
      role: 'Candidate' // Public self-registration ALWAYS creates Candidate role ONLY
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'hexaware_secret_jwt_token_key_123!',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isProfileCompleted: user.isProfileCompleted,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role || 'Candidate',
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'hexaware_secret_jwt_token_key_123!',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'Candidate',
            isProfileCompleted: user.isProfileCompleted,
            college: user.college,
            degree: user.degree,
            graduationYear: user.graduationYear,
            preferredStack: user.preferredStack,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get user by token
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedMentorId', 'name email designation department');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error loading user context' });
  }
});

// @route   PUT api/auth/profile
// @desc    Complete user profile details
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { 
    college, university, degree, branch, currentYear, graduationYear, 
    cgpa, dob, gender, mobile, city, state, country, isDeclarationConfirmed, preferredStack, isProfileCompleted, resumeUrl,
    linkedinUrl, githubUrl, skills, certifications, preferredLocation, activeBacklogs, emergencyContact, languagesKnown, internshipDuration
  } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.college = college !== undefined ? college : user.college;
    user.university = university !== undefined ? university : user.university;
    user.degree = degree !== undefined ? degree : user.degree;
    user.branch = branch !== undefined ? branch : user.branch;
    user.currentYear = currentYear !== undefined ? currentYear : user.currentYear;
    user.graduationYear = graduationYear !== undefined ? graduationYear : user.graduationYear;
    user.cgpa = cgpa !== undefined ? cgpa : user.cgpa;
    user.dob = dob !== undefined ? dob : user.dob;
    user.gender = gender !== undefined ? gender : user.gender;
    user.mobile = mobile !== undefined ? mobile : user.mobile;
    user.city = city !== undefined ? city : user.city;
    user.state = state !== undefined ? state : user.state;
    user.country = country !== undefined ? country : user.country;
    user.isDeclarationConfirmed = isDeclarationConfirmed !== undefined ? isDeclarationConfirmed : user.isDeclarationConfirmed;
    user.preferredStack = preferredStack !== undefined ? preferredStack : user.preferredStack;
    user.internshipDuration = internshipDuration !== undefined ? internshipDuration : user.internshipDuration;
    user.resumeUrl = resumeUrl !== undefined ? resumeUrl : user.resumeUrl;
    user.linkedinUrl = linkedinUrl !== undefined ? linkedinUrl : user.linkedinUrl;
    user.githubUrl = githubUrl !== undefined ? githubUrl : user.githubUrl;
    user.skills = skills !== undefined ? skills : user.skills;
    user.certifications = certifications !== undefined ? certifications : user.certifications;
    user.preferredLocation = preferredLocation !== undefined ? preferredLocation : user.preferredLocation;
    user.activeBacklogs = activeBacklogs !== undefined ? activeBacklogs : user.activeBacklogs;
    user.emergencyContact = emergencyContact !== undefined ? emergencyContact : user.emergencyContact;
    user.languagesKnown = languagesKnown !== undefined ? languagesKnown : user.languagesKnown;
    
    if (isProfileCompleted === true) {
      // Verify every required field is present and non-empty
      const requiredFields = [
        'college', 'degree', 'branch', 'currentYear', 
        'graduationYear', 'cgpa', 'dob', 'gender', 'mobile', 'city', 'state', 'country'
      ];
      
      for (const field of requiredFields) {
        if (!user[field] || user[field].trim() === '') {
          return res.status(400).json({ msg: `All setup boxes must be completed. Field '${field}' is empty.` });
        }
      }
      
      if (!user.isDeclarationConfirmed) {
        return res.status(400).json({ msg: 'Declarations must be confirmed to proceed.' });
      }

      user.isProfileCompleted = true;
    }

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isProfileCompleted: user.isProfileCompleted,
      college: user.college,
      university: user.university,
      degree: user.degree,
      branch: user.branch,
      currentYear: user.currentYear,
      graduationYear: user.graduationYear,
      cgpa: user.cgpa,
      dob: user.dob,
      gender: user.gender,
      mobile: user.mobile,
      city: user.city,
      state: user.state,
      country: user.country,
      isDeclarationConfirmed: user.isDeclarationConfirmed,
      preferredStack: user.preferredStack,
    });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ msg: 'Server error updating profile' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change logged in user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password changed successfully!' });
  } catch (err) {
    console.error('Error changing password:', err.message);
    res.status(500).send('Server error updating password');
  }
});

module.exports = router;
