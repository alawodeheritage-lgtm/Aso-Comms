// backend/routes/complaints.js
const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const Repair = require('../models/repair');
const CatchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isStaff, validateComplaint } = require('../middleware');

// GET /complaints - Get all complaints
router.get('/', isLoggedIn, CatchAsync(async (req, res) => {
    // console.log('📊 GET /complaints - Fetching all complaints');
    // console.log('👤 User:', req.user._id, req.user.role);

    const { status } = req.query;
    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo' || req.user.isStaff;

    const baseFilter = isManagement ? {} : { submittedBy: req.user._id };

    const listQuery = { ...baseFilter };
    if (status) listQuery.status = status;

    const complaints = await Complaint.find(listQuery)
        .populate('submittedBy', 'username email phoneNumber')
        .populate('resolvedBy', 'username email')
        .populate('repair', 'ticketId deviceModel status')
        .sort({ createdAt: -1 });

    // console.log(`📊 Found ${complaints.length} complaints`);

    res.json({
        complaints: complaints,
        count: complaints.length,
        isManagement: isManagement
    });
}));

// GET /complaints/new - Get form data with prefills
router.get('/new', isLoggedIn, CatchAsync(async (req, res) => {
    let { ticketId } = req.query;
    let prefilledRepair = null;
    let userRepairs = [];
    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo' || req.user.isStaff;

    const userPhone = req.user.phoneNumber || req.user.phone;

    if (!isManagement) {
        userRepairs = await Repair.find({
            $or: [
                { submittedBy: req.user._id },
                { user: req.user._id },
                { owner: req.user._id },
                ...(userPhone ? [{ phoneNumber: userPhone }, { customerPhone: userPhone }] : [])
            ]
        }).sort({ createdAt: -1 });
    }

    if (ticketId) {
        prefilledRepair = await Repair.findOne({ ticketId: ticketId.trim().toUpperCase() });
    } else if (userRepairs.length > 0) {
        prefilledRepair = userRepairs[0];
        ticketId = prefilledRepair.ticketId;
    }

    res.json({
        userRepairs,
        prefilledRepair,
        ticketId: ticketId || '',
        isManagement,
        user: req.user
    });
}));

// POST /complaints - Create Complaint Ticket
// backend/routes/complaints.js - Updated POST route
router.post('/', isLoggedIn, validateComplaint, CatchAsync(async (req, res) => {
    // console.log('📤 POST /complaints - Creating new complaint');
    // console.log('📤 Request body:', req.body);
    // console.log('👤 User:', req.user._id);

    const { ticketId, customerName, customerPhone, subject, category, description, images } = req.body;

    const repair = await Repair.findOne({ ticketId: ticketId.toUpperCase() });

    let customerEmail = req.user.email;
    if (!customerEmail && repair) {
        customerEmail = repair.customerEmail;
    }

    const newComplaint = new Complaint({
        ticketId: ticketId.toUpperCase(),
        repair: repair ? repair._id : null,
        submittedBy: req.user._id,
        customerName: customerName || req.user.username || 'Customer',
        customerPhone: customerPhone || req.user.phoneNumber || 'N/A',
        customerEmail: customerEmail || '',
        subject,
        category,
        description,
        status: 'Open',
        severity: 'medium',
        images: images || [], // ✅ Add images
        statusHistory: [{
            status: 'Open',
            changedBy: req.user._id,
            notes: 'Complaint created',
            changedAt: new Date()
        }]
    });

    await newComplaint.save();

    // console.log('✅ Complaint created:', newComplaint._id);

    res.status(201).json({
        success: true,
        message: `Complaint for Ticket #${newComplaint.ticketId} submitted successfully.`,
        complaint: newComplaint
    });
}));

// ✅ FIXED: PATCH /complaints/:id/status - Update Status
router.patch('/:id/status', isLoggedIn, isStaff, CatchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    // console.log(`📤 PATCH /complaints/${id}/status - Updating status to:`, status);

    // ✅ Find the complaint first
    const complaint = await Complaint.findById(id);
    if (!complaint) {
        return res.status(404).json({ error: 'Complaint record not found.' });
    }

    // ✅ Update only the fields that are changing
    complaint.status = status;
    if (resolutionNotes !== undefined) {
        complaint.resolutionNotes = resolutionNotes;
    }

    if (status === 'Resolved') {
        complaint.resolvedBy = req.user._id;
        complaint.resolvedAt = new Date();
    }

    // ✅ Save the complaint - don't change other fields
    await complaint.save();

    // console.log('✅ Complaint status updated');

    // ✅ Return the updated complaint
    const updatedComplaint = await Complaint.findById(id)
        .populate('submittedBy', 'email role')
        .populate('resolvedBy', 'email')
        .populate('repair', 'ticketId deviceModel status');

    res.json({
        success: true,
        message: `Complaint status updated to: ${status}`,
        complaint: updatedComplaint
    });
}));

// GET /complaints/:id - Get single complaint
router.get('/:id', isLoggedIn, CatchAsync(async (req, res) => {
    const { id } = req.params;
    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo' || req.user.isStaff;

    const complaint = await Complaint.findById(id)
        .populate('submittedBy', 'email role')
        .populate('resolvedBy', 'email')
        .populate('repair', 'ticketId deviceModel status');

    if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
    }

    if (!isManagement && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You do not have permission to view this complaint' });
    }

    res.json({ complaint });
}));
router.patch('/:id/status', isLoggedIn, isStaff, CatchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    // console.log(`📤 PATCH /complaints/${id}/status - Updating status to:`, status);
    // console.log('📝 Resolution Notes:', resolutionNotes);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        return res.status(404).json({ error: 'Complaint record not found.' });
    }

    // Add to status history
    complaint.statusHistory.push({
        status: status,
        changedBy: req.user._id,
        notes: resolutionNotes || complaint.resolutionNotes,
        changedAt: new Date()
    });

    // Update status
    complaint.status = status;

    // Update resolution notes if provided
    if (resolutionNotes !== undefined && resolutionNotes.trim() !== '') {
        complaint.resolutionNotes = resolutionNotes.trim();
    }

    // If resolving, set resolvedBy and resolvedAt
    if (status === 'Resolved') {
        complaint.resolvedBy = req.user._id;
        complaint.resolvedAt = new Date();

        // If no resolution notes were provided, set a default
        if (!complaint.resolutionNotes || complaint.resolutionNotes === '') {
            complaint.resolutionNotes = `Resolved by ${req.user.username} on ${new Date().toLocaleString()}`;
        }
    }

    await complaint.save();

    // Populate for response
    await complaint.populate('resolvedBy', 'username email');
    await complaint.populate('submittedBy', 'username email');

    // console.log('✅ Complaint status updated:', complaint.status);

    res.json({
        success: true,
        message: `Complaint status updated to: ${status}`,
        complaint: complaint
    });
}));

// POST /complaints - Create Complaint Ticket
router.post('/', isLoggedIn, validateComplaint, CatchAsync(async (req, res) => {
    // console.log('📤 POST /complaints - Creating new complaint');
    // console.log('📤 Request body:', req.body);
    // console.log('👤 User:', req.user._id);

    const { ticketId, customerName, customerPhone, subject, category, description } = req.body;

    const repair = await Repair.findOne({ ticketId: ticketId.toUpperCase() });

    let customerEmail = req.user.email;
    if (!customerEmail && repair) {
        customerEmail = repair.customerEmail;
    }

    const newComplaint = new Complaint({
        ticketId: ticketId.toUpperCase(),
        repair: repair ? repair._id : null,
        submittedBy: req.user._id,
        customerName: customerName || req.user.username || 'Customer',
        customerPhone: customerPhone || req.user.phoneNumber || 'N/A',
        customerEmail: customerEmail || '',
        subject,
        category,
        description,
        status: 'Open',
        severity: 'medium',
        statusHistory: [{
            status: 'Open',
            changedBy: req.user._id,
            notes: 'Complaint created',
            changedAt: new Date()
        }]
    });

    await newComplaint.save();

    // console.log('✅ Complaint created:', newComplaint._id);

    res.status(201).json({
        success: true,
        message: `Complaint for Ticket #${newComplaint.ticketId} submitted successfully.`,
        complaint: newComplaint
    });
}));

module.exports = router;