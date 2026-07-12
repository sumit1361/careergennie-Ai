/**
 * scripts/createAdmin.js
 *
 * There is no public signup path for the 'admin' role by design (see
 * authController.js — signup only accepts 'student' | 'recruiter').
 * Run this script once to create the first admin account directly in
 * the database.
 *
 * Usage:
 *   node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPass123"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error('Usage: node scripts/createAdmin.js "<name>" <email> <password>');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log(`Existing user ${email} promoted to admin.`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ name, email, password: hashedPassword, role: 'admin' });
      console.log(`Admin account created for ${email}.`);
    }
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
