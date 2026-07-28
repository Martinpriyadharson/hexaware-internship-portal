const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanCandidates() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hexaware-portal');
    console.log('MongoDB connected...');

    const allCandidates = await User.find({ role: 'Candidate' });
    console.log(`Total Candidates found: ${allCandidates.length}`);

    // Keep 4 clean dummy candidates + user created candidates
    const keepEmails = [
      'karthik@college.edu',
      'rosevin@gmail.com',
      'sambilliam89@gmail.com',
      'siddharth@college.edu',
      'rithika@college.edu'
    ];

    // Delete extra candidates not in the keep list
    const result = await User.deleteMany({
      role: 'Candidate',
      email: { $nin: keepEmails }
    });

    console.log(`Deleted ${result.deletedCount} extra dummy candidates.`);

    const remainingCandidates = await User.find({ role: 'Candidate' });
    console.log(`Remaining Clean Candidates (${remainingCandidates.length}):`);
    remainingCandidates.forEach(c => console.log(` - ${c.name} (${c.email}) [${c.preferredStack || 'Python Full Stack'}]`));

    mongoose.connection.close();
  } catch (err) {
    console.error('Error cleaning candidates:', err);
  }
}

cleanCandidates();
