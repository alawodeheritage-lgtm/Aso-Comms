// backend/models/expense.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  description: {
    type: String,
    required: [true, 'Expense description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Parts Purchase',
      'Shop Rent',
      'Tools/Equipment',
      'Electricity/Utility',
      'Transport',
      'Food',
      'Other'
    ],
    default: 'Parts Purchase'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  loggedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateLogged: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);