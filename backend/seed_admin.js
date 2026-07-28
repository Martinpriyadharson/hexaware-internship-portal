const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hexaware-portal');
    console.log('MongoDB connected...');

    let admin = await User.findOne({ email: 'admin@hexaware.com' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    if (!admin) {
      admin = new User({
        name: 'Hexaware Admin',
        email: 'admin@hexaware.com',
        password: hashedPassword,
        role: 'Admin',
        isProfileCompleted: true
      });
      await admin.save();
      console.log('Successfully created Admin account: admin@hexaware.com / password123');
    } else {
      admin.role = 'Admin';
      admin.password = hashedPassword;
      await admin.save();
      console.log('Successfully updated Admin account: admin@hexaware.com / password123');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding Admin user:', err);
  }
}

seedAdmin();
