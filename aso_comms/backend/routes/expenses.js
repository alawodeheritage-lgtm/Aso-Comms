// routes/expenses.js
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Expense = require('../models/expense');
const { isLoggedIn, isStaff, validateExpense } = require('../middleware');

// ====== GET: Render dedicated expense management page ======
router.get('/', isLoggedIn, isStaff, catchAsync(async (req, res) => {
    // Fetch all expenses, sort newest first, and populate creator details
    const expenses = await Expense.find({})
        .populate('loggedBy', 'username name email')
        .sort({ dateLogged: -1, createdAt: -1 });

    // Calculate aggregated expense total for quick dashboard stat badges
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.json('expenses', { expenses, totalExpenses });
}));

// ====== POST: Process and save new validated expense ======
router.post('/', isLoggedIn, isStaff, validateExpense, catchAsync(async (req, res) => {
    const { description, amount, category } = req.body;

    const newExpense = new Expense({
        description,
        amount,
        category,
        loggedBy: req.user._id
    });

    await newExpense.save();
    req.flash('success', 'Expense successfully logged!');
    res.redirect('/expenses');
}));

// ====== DELETE: Remove an expense entry (Staff / Admin guarded) ======
router.delete('/:id', isLoggedIn, isStaff, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    req.flash('success', 'Expense entry removed successfully.');
    res.redirect('/expenses');
}));

module.exports = router;