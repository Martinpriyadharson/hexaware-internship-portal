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
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
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
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/profile
// @desc    Complete user profile details
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { 
    college, university, degree, branch, currentYear, graduationYear, 
    cgpa, dob, gender, mobile, city, state, country, isDeclarationConfirmed, preferredStack, isProfileCompleted 
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
    } else if (isProfileCompleted === false) {
      user.isProfileCompleted = false;
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
