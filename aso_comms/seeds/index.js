const mongoose = require('mongoose');
const Repair = require('../models/repair'); // Goes up one folder to find the model

// Use your Atlas String here
const dbUrl = "mongodb://alawodeheritage:Anjola2007@ac-nrf1jer-shard-00-00.k1gprpa.mongodb.net:27017,ac-nrf1jer-shard-00-01.k1gprpa.mongodb.net:27017,ac-nrf1jer-shard-00-02.k1gprpa.mongodb.net:27017/Asocomms?ssl=true&replicaSet=atlas-kx32iu-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(dbUrl)
  .then(() => console.log("Atlas Connected for Seeding..."))
  .catch(err => console.log(err));

const seedDB = async () => {
  // Clear the database
  await Repair.deleteMany({});

  // Create a list of realistic repairs
  const sampleRepairs = [
    {
      customerName: "Heritage Alawode",
      phoneNumber: "08012345678",
      deviceModel: "iPhone 14 Pro",
      isDead: false,
      issueDescription: "Cracked screen replacement.",
      financials: { totalEstimate: 120000, amountPaid: 50000 }
    },
    {
      customerName: "Blessing Okoro",
      phoneNumber: "09088776655",
      deviceModel: "Samsung S23 Ultra",
      isDead: true,
      issueDescription: "No power after water damage.",
      financials: { totalEstimate: 200000, amountPaid: 100000 }
    },
    {
      customerName: "James Bond",
      phoneNumber: "07011223344",
      deviceModel: "MacBook Air M2",
      isDead: false,
      issueDescription: "Battery draining too fast.",
      financials: { totalEstimate: 45000, amountPaid: 45000 }
    }
  ];

  // Save them to Atlas
  for (let repairData of sampleRepairs) {
    const repair = new Repair(repairData);
    await repair.save();
  }
  console.log("Database Seeded Successfully!");
};

seedDB().then(() => {
  mongoose.connection.close();
});