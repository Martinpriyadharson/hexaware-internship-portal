const mongoose = require('mongoose');
const User = require('./models/User');

async function testProfile() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hexaware-portal');
    console.log('MongoDB connected...');

    const candidate = await User.findOne({ role: 'Candidate' });
    if (!candidate) {
      console.log('No candidate found');
      return;
    }

    console.log(`Found candidate: ${candidate.name} (${candidate.email})`);
    candidate.college = 'Tagore Engineering College';
    candidate.degree = 'B.Tech';
    candidate.branch = 'Computer Science & Engineering';
    candidate.currentYear = 'Final Year (4th Year)';
    candidate.graduationYear = '2026';
    candidate.cgpa = '8.50';
    candidate.dob = '2004-05-15';
    candidate.gender = 'Male';
    candidate.mobile = '9876543210';
    candidate.city = 'Chennai';
    candidate.state = 'Tamil Nadu';
    candidate.country = 'India';
    candidate.isDeclarationConfirmed = true;
    candidate.isProfileCompleted = true;

    await candidate.save();
    console.log('Candidate profile saved successfully!');

    mongoose.connection.close();
  } catch (err) {
    console.error('Error saving profile:', err);
  }
}

testProfile();
