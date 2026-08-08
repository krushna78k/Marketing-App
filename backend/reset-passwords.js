const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/marketing-app').then(async () => {
  const db = mongoose.connection.db;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);
  await db.collection('users').updateMany({}, { $set: { password } });
  console.log('Passwords updated to password123');
  process.exit(0);
});
