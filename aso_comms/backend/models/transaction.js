const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expenditure'], // Tracks money coming in vs. going out
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String, // e.g., 'Repair Deposit', 'Final Payment', 'Screen Purchase', 'Rent'
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    repairId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repair' // Links the transaction back to a specific phone repair ticket
    },
    date: {
        type: Date,
        default: Date.now // Automatically logs the timestamp
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);