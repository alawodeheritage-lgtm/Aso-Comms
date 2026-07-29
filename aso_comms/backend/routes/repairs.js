// routes/repairs.js
const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');
const Expense = require('../models/expense');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isStaff, validateRepair } = require('../middleware');

// ==========================================
// GET ALL REPAIRS
// ==========================================
router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    console.log('📋 FETCH REPAIRS REQUEST');
    console.log('📧 User:', req.user?.username || 'Unknown');

    const { status } = req.query;
    let query = {};

    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo';

    if (!isManagement) {
        query.owner = req.user._id;
    }

    if (status) query.status = status;

    const repairs = await Repair.find(query)
        .populate('owner', 'username email')
        .sort({ dateLogged: -1, createdAt: -1 });

    console.log(`📊 Found ${repairs.length} repairs`);
    
    res.json({
        success: true,
        count: repairs.length,
        repairs: repairs
    });
}));

// ==========================================
// CREATE NEW REPAIR
// ==========================================
router.post('/', isLoggedIn, validateRepair, async (req, res, next) => {
    try {
        console.log('========================================');
        console.log('📝 CREATE REPAIR REQUEST');
        console.log('📧 User:', req.user?.username || 'Unknown');
        console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
        console.log('========================================');

        // Create repair data - simplified, no hardware/accessories
        const repairData = {
            customerName: req.body.customerName,
            phoneNumber: req.body.phoneNumber,
            customerEmail: req.body.customerEmail,
            deviceModel: req.body.deviceModel,
            issueDescription: req.body.issueDescription || '',
            status: req.body.status || 'Pending',
            priority: req.body.priority || 'medium',
            assignedTo: req.body.assignedTo || 'Unassigned',
            financials: {
                totalEstimate: req.body.financials?.totalEstimate || 0,
                amountPaid: req.body.financials?.amountPaid || 0,
            },
            owner: req.user._id
        };

        console.log('📦 Processed Repair Data:', JSON.stringify(repairData, null, 2));

        const newRepair = new Repair(repairData);
        
        console.log('💾 Saving to database...');
        await newRepair.save();
        
        console.log('✅ Repair saved successfully!');
        console.log('🎫 Ticket ID:', newRepair.ticketId);
        console.log('🆔 Repair ID:', newRepair._id);
        console.log('========================================');

        res.status(201).json({
            success: true,
            message: `Repair created successfully with ticket ${newRepair.ticketId}`,
            repair: newRepair
        });

    } catch (error) {
        console.error('❌ Error creating repair:', error);
        console.error('❌ Error stack:', error.stack);
        next(error);
    }
});

// ==========================================
// GET SINGLE REPAIR
// ==========================================
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const repair = await Repair.findById(id).populate('owner');

    if (!repair) {
        req.flash('error', 'Cannot find that repair record!');
        return res.redirect('/repairs');
    }

    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo';

    if (!isManagement && (!repair.owner || !repair.owner.equals(req.user._id))) {
        req.flash('error', 'You do not have permission to view that repair ticket!');
        return res.redirect('/repairs');
    }

    res.json({
        success: true,
        repair: repair
    });
}));

// ==========================================
// UPDATE REPAIR
// ==========================================
router.put('/:id', isLoggedIn, isStaff, validateRepair, async (req, res, next) => {
    try {
        const { id } = req.params;
        const repair = await Repair.findById(id);

        if (!repair) {
            return res.status(404).json({
                success: false,
                error: 'Repair not found'
            });
        }

        // Update only allowed fields
        const updateData = {
            customerName: req.body.customerName,
            phoneNumber: req.body.phoneNumber,
            customerEmail: req.body.customerEmail,
            deviceModel: req.body.deviceModel,
            issueDescription: req.body.issueDescription || '',
            status: req.body.status || repair.status,
            priority: req.body.priority || repair.priority,
            assignedTo: req.body.assignedTo || repair.assignedTo,
            financials: {
                totalEstimate: req.body.financials?.totalEstimate || repair.financials.totalEstimate,
                amountPaid: req.body.financials?.amountPaid || repair.financials.amountPaid,
            }
        };

        Object.assign(repair, updateData);
        await repair.save();

        res.json({
            success: true,
            message: 'Repair updated successfully',
            repair: repair
        });

    } catch (error) {
        console.error('❌ Error updating repair:', error);
        next(error);
    }
});

// ==========================================
// UPDATE STATUS ONLY
// ==========================================
router.patch('/:id/status', isLoggedIn, isStaff, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedRepair = await Repair.findByIdAndUpdate(
            id,
            { status },
            { runValidators: true, new: true }
        );

        if (!updatedRepair) {
            return res.status(404).json({
                success: false,
                error: 'Repair not found'
            });
        }

        res.json({
            success: true,
            message: `Status updated to: ${status}`,
            repair: updatedRepair
        });

    } catch (error) {
        console.error('❌ Error updating status:', error);
        next(error);
    }
});

// ==========================================
// DELETE REPAIR
// ==========================================
router.delete('/:id', isLoggedIn, isStaff, async (req, res, next) => {
    try {
        const { id } = req.params;
        const repair = await Repair.findByIdAndDelete(id);

        if (!repair) {
            return res.status(404).json({
                success: false,
                error: 'Repair not found'
            });
        }

        res.json({
            success: true,
            message: `Repair ${repair.ticketId || ''} deleted successfully`
        });

    } catch (error) {
        console.error('❌ Error deleting repair:', error);
        next(error);
    }
});

module.exports = router;