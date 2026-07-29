const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  // Renamed to 'description' (or added as alias) to match your view form input
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
  // Updated enum values to match your select dropdown in expenses.ejs
  category: {
    type: String,
    required: true,
    enum: [
      'Parts Purchase',
      'Shop Rent',
      'Tools/Equipment',
      'Electricity/Utility',
      'Transport',
      'Other'
    ],
    default: 'Parts Purchase'
  },
  notes: {
    type: String,
    trim: true
  },
  loggedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dateLogged: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);