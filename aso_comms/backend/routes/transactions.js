const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction'); // Using your actual Transaction model
const CatchAsync = require('../utils/CatchAsync'); // Matching your file's capital 'C'

// ====== SYSTEM FINANCIAL LEDGER HISTORY ======
// Route path relative to the mount: GET /transactions
router.get('/', CatchAsync(async (req, res) => {
    // 1. Fetch all logged ledger items and sort them newest first
    const transactions = await Transaction.find({}).sort({ date: -1 });

    let totalIncome = 0;
    let totalExpenditure = 0;

    // 2. Loop through and run your mathematical tallies
    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        if (t.type === 'expenditure') totalExpenditure += t.amount;
    });

    const netProfit = totalIncome - totalExpenditure;

    // 3. Render the view with variables matching your exact layout names
    res.json('transactions/index', {
        transactions,
        totalIncome,
        totalExpenditure,
        netProfit
    });
}));

module.exports = router;