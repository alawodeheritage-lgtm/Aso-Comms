// backend/routes/expenses.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isStaff } = require('../middleware');

// ==========================================
// GET ALL EXPENSES - FIXED
// ==========================================
router.get('/', isLoggedIn, isStaff, async (req, res) => {
    try {
        console.log('📋 FETCHING EXPENSES');
        console.log('👤 User:', req.user?.username || 'Unknown');

        const expenses = await Expense.find({})
            .populate('loggedBy', 'username email')
            .sort({ dateLogged: -1, createdAt: -1 });

        console.log(`📊 Found ${expenses.length} expenses`);

        res.json({
            success: true,
            count: expenses.length,
            expenses: expenses
        });
    } catch (error) {
        console.error('❌ Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch expenses'
        });
    }
});

// ==========================================
// CREATE NEW EXPENSE - FIXED
// ==========================================
router.post('/', isLoggedIn, isStaff, async (req, res) => {
    try {
        console.log('========================================');
        console.log('📝 CREATE EXPENSE REQUEST');
        console.log('👤 User:', req.user?.username || 'Unknown');
        console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
        console.log('========================================');

        const { description, amount, category, notes } = req.body;

        // Validate required fields
        if (!description || !amount || !category) {
            return res.status(400).json({
                success: false,
                error: 'Description, amount, and category are required'
            });
        }

        const newExpense = new Expense({
            description: description.trim(),
            amount: Number(amount),
            category: category,
            notes: notes || '',
            loggedBy: req.user._id,
            status: 'pending'
        });

        console.log('💾 Saving expense to database...');
        await newExpense.save();

        // Populate loggedBy for response
        await newExpense.populate('loggedBy', 'username email');

        console.log('✅ Expense saved successfully!');
        console.log('🆔 Expense ID:', newExpense._id);
        console.log('========================================');

        res.status(201).json({
            success: true,
            message: 'Expense logged successfully',
            expense: newExpense
        });

    } catch (error) {
        console.error('❌ Error creating expense:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create expense'
        });
    }
});

// ==========================================
// UPDATE EXPENSE STATUS (Approve/Reject) - FIXED
// ==========================================
router.patch('/:id/status', isLoggedIn, isStaff, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('📝 UPDATE EXPENSE STATUS');
        console.log('🆔 Expense ID:', id);
        console.log('📊 New Status:', status);
        console.log('👤 User:', req.user?.username || 'Unknown');

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be pending, approved, or rejected'
            });
        }

        const expense = await Expense.findByIdAndUpdate(
            id,
            { status: status },
            { new: true, runValidators: true }
        ).populate('loggedBy', 'username email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        console.log('✅ Expense status updated to:', status);

        res.json({
            success: true,
            message: `Expense ${status}`,
            expense: expense
        });

    } catch (error) {
        console.error('❌ Error updating expense status:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update expense status'
        });
    }
});

// ==========================================
// DELETE EXPENSE - FIXED
// ==========================================
router.delete('/:id', isLoggedIn, isStaff, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DELETE EXPENSE');
        console.log('🆔 Expense ID:', id);
        console.log('👤 User:', req.user?.username || 'Unknown');

        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        console.log('✅ Expense deleted successfully');

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting expense:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete expense'
        });
    }
});

// ==========================================
// TEST ROUTE - To verify expenses route is working
// ==========================================
router.get('/test', (req, res) => {
    res.json({
        message: 'Expenses route is working! 🎉',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;