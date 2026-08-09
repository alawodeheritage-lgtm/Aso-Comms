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

    // Log images for debugging
    repairs.forEach((repair, index) => {
        console.log(`📸 Repair ${index + 1} (${repair.ticketId}): images =`, repair.images);
    });

    res.json({
        success: true,
        count: repairs.length,
        repairs: repairs
    });
}));

// ==========================================
// CREATE NEW REPAIR - FIXED
// ==========================================
router.post('/', isLoggedIn, validateRepair, async (req, res, next) => {
    try {
        console.log('========================================');
        console.log('📝 CREATE REPAIR REQUEST');
        console.log('📧 User:', req.user?.username || 'Unknown');
        console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
        console.log('========================================');

        // ✅ Extract images from request body
        const { images } = req.body;
        console.log('📸 Images received in backend:', images);
        console.log('📸 Images type:', typeof images);
        console.log('📸 Is array:', Array.isArray(images));

        // Create repair data WITH images
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
            owner: req.user._id,
            images: images || [] // ✅ Add images to repairData
        };

        console.log('📦 Processed Repair Data with images:', JSON.stringify(repairData, null, 2));

        const newRepair = new Repair(repairData);

        console.log('💾 Saving to database...');
        console.log('📸 Images being saved:', newRepair.images);

        // Save with error handling
        try {
            await newRepair.save();
        } catch (saveError) {
            console.error('❌ Save error:', saveError);
            return res.status(400).json({
                success: false,
                error: saveError.message || 'Failed to save repair'
            });
        }

        console.log('✅ Repair saved successfully!');
        console.log('🎫 Ticket ID:', newRepair.ticketId);
        console.log('🆔 Repair ID:', newRepair._id);
        console.log('📸 Saved images:', newRepair.images);
        console.log('========================================');

        res.status(201).json({
            success: true,
            message: `Repair created successfully with ticket ${newRepair.ticketId}`,
            repair: newRepair
        });

    } catch (error) {
        console.error('❌ Error creating repair:', error);
        console.error('❌ Error stack:', error.stack);

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create repair',
            details: error.stack
        });
    }
});

// ==========================================
// GET SINGLE REPAIR
// ==========================================
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const repair = await Repair.findById(id).populate('owner');

    if (!repair) {
        return res.status(404).json({
            success: false,
            error: 'Cannot find that repair record!'
        });
    }

    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo';

    if (!isManagement && (!repair.owner || !repair.owner.equals(req.user._id))) {
        return res.status(403).json({
            success: false,
            error: 'You do not have permission to view that repair ticket!'
        });
    }

    res.json({
        success: true,
        repair: repair
    });
}));

// ==========================================
// UPDATE REPAIR
// ==========================================
// routes/repairs.js - Update the PUT route

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

        // ✅ Include images in the update
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
            },
            images: req.body.images || repair.images  // ✅ ADD THIS LINE
        };

        Object.assign(repair, updateData);
        await repair.save();

        // ✅ Populate the repair with the updated images
        await repair.populate('owner', 'username email');

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