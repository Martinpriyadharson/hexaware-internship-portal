const mongoose = require('./models/User').db ? require('mongoose') : require('./node_modules/mongoose');
const Question = require('./models/Question');

async function setAnswersToA() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hexaware-portal');
    console.log('MongoDB connected...');

    const res = await Question.updateMany({}, { correctAnswer: 0 });
    console.log(`Successfully updated questions! All questions now have Option A (index 0) as the correct answer!`);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating questions:', err);
  }
}

setAnswersToA();
