// routes/transactions.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const { isLoggedIn, isStaff } = require('../middleware');

// ==========================================
// GET ALL TRANSACTIONS
// ==========================================
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('loggedBy', 'username email')
            .sort({ createdAt: -1 });

        // ✅ FIX: Use status() then json()
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions: transactions
        });
    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==========================================
// GET SINGLE TRANSACTION
// ==========================================
router.get('/:id', isLoggedIn, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('loggedBy', 'username email');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }

        res.status(200).json({
            success: true,
            transaction: transaction
        });
    } catch (error) {
        console.error('❌ Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==========================================
// CREATE TRANSACTION
// ==========================================
router.post('/', isLoggedIn, isStaff, async (req, res) => {
    try {
        const { description, amount, type, category, notes, repairId } = req.body;

        // Validate required fields
        if (!description || !amount || !type) {
            return res.status(400).json({
                success: false,
                error: 'Description, amount, and type are required'
            });
        }

        const newTransaction = new Transaction({
            description,
            amount,
            type,
            category: category || 'Other',
            notes: notes || '',
            repairId: repairId || null,
            loggedBy: req.user._id
        });

        await newTransaction.save();
        await newTransaction.populate('loggedBy', 'username email');

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            transaction: newTransaction
        });
    } catch (error) {
        console.error('❌ Error creating transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==========================================
// UPDATE TRANSACTION
// ==========================================
router.put('/:id', isLoggedIn, isStaff, async (req, res) => {
    try {
        const { description, amount, type, category, notes } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }

        transaction.description = description || transaction.description;
        transaction.amount = amount || transaction.amount;
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.notes = notes || transaction.notes;

        await transaction.save();
        await transaction.populate('loggedBy', 'username email');

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            transaction: transaction
        });
    } catch (error) {
        console.error('❌ Error updating transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==========================================
// DELETE TRANSACTION
// ==========================================
router.delete('/:id', isLoggedIn, isStaff, async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;