// seedFinal.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const dbUrl = process.env.DATABASE_URL;

mongoose.connect(dbUrl)
  .then(() => console.log("🔌 Connected safely to MongoDB Atlas cluster..."))
  .catch(err => {
    console.error("❌ Database Connection Error:", err);
    process.exit(1);
  });

const seedStaff = async () => {
  try {
    // Clear any old administrative tests to ensure a clean setup
    await User.deleteMany({ role: { $in: ['manager', 'ceo'] } });
    console.log("🧹 Cleaned old staff placeholders...");

    // 🌟 1. YOUR MANAGER ACCOUNT (Change these values to yours!)
    const managerAccount = new User({
      username: "Alawode Heritage",       // 👈 Put your login username
      email: "alawodeheritage2@gmail.com",       // 👈 Put your email address
      role: "manager",
      phoneNumber: "+2347015677280"
    });
    await User.register(managerAccount, "He2rm@ns"); // 👈 Put your login password
    console.log("🎯 Manager account created successfully.");

    // 🌟 2. YOUR OGA'S CEO ACCOUNT (Change these values to his!)
    const ceoAccount = new User({
      username: "Ajao Olalekan",        // 👈 Put your Oga's username
      email: "lekan@gmail.com",        // 👈 Put your Oga's email address
      role: "ceo",
      phoneNumber: "+2348068676961"
    });
    await User.register(ceoAccount, "1ek@n001"); // 👈 Put your Oga's password
    console.log("🎯 CEO account created successfully.");

  } catch (e) {
    console.error("❌ Seeding Error:", e.message);
  } finally {
    mongoose.connection.close();
    console.log("⚙️  Database link closed safely.");
  }
};

seedStaff();