// routes/expenses.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const { isLoggedIn, isStaff } = require('../middleware');

// GET ALL EXPENSES
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const expenses = await Expense.find({})
            .populate('loggedBy', 'username email')
            .sort({ dateLogged: -1 });

        // ✅ FIX: Use status() then json()
        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses: expenses
        });
    } catch (error) {
        console.error('❌ Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// CREATE EXPENSE
router.post('/', isLoggedIn, isStaff, async (req, res) => {
    try {
        const { description, amount, category, notes } = req.body;

        if (!description || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Description and amount are required'
            });
        }

        const newExpense = new Expense({
            description,
            amount,
            category: category || 'Other',
            notes: notes || '',
            loggedBy: req.user._id,
            status: 'pending'
        });

        await newExpense.save();
        await newExpense.populate('loggedBy', 'username email');

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            expense: newExpense
        });
    } catch (error) {
        console.error('❌ Error creating expense:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// UPDATE EXPENSE STATUS
router.patch('/:id/status', isLoggedIn, isStaff, async (req, res) => {
    try {
        const { status } = req.body;
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        expense.status = status;
        await expense.save();

        res.status(200).json({
            success: true,
            message: `Expense ${status}`,
            expense: expense
        });
    } catch (error) {
        console.error('❌ Error updating expense:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE EXPENSE
router.delete('/:id', isLoggedIn, isStaff, async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting expense:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;