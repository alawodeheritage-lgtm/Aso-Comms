// routes/track.js
const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');
const catchAsync = require('../utils/catchAsync');
const rateLimit = require('express-rate-limit');

// Rate limiting: max 10 requests per minute per IP
const trackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many requests. Please wait a moment before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ====== PUBLIC STATUS LOOKUP PAGE (returns the form) ======
// Since this is an API, we return a simple message; the frontend will show the form.
router.get('/', (req, res) => {
    res.json({
        message: 'Public tracking endpoint. Use /track/results?ticketId=YOUR_ID',
        example: '/track/results?ticketId=ASO-2026-XXXXX'
    });
});

// ====== PUBLIC STATUS RESULTS PAGE ======
router.get('/results', trackLimiter, catchAsync(async (req, res) => {
    const { ticketId } = req.query;

    if (!ticketId || ticketId.trim() === "") {
        return res.status(400).json({ error: 'Please enter a ticket ID to search.' });
    }

    const repair = await Repair.findOne({ ticketId: ticketId.trim().toUpperCase() });

    if (!repair) {
        return res.status(404).json({ error: 'No repair ticket found with that ID.' });
    }

    // ====== HARDENED MASKING ======
    // Mask customer name: first char only, rest asterisks
    const rawName = repair.customerName || "Valued Customer";
    const maskedName = rawName.split(' ').map(word => {
        if (word.length <= 1) return word;
        return word[0] + '*'.repeat(word.length - 1);
    }).join(' ');

    // Mask phone: show first 3 and last 3, rest asterisks
    const rawPhone = repair.customerPhone || "080XXXXXXXX";
    const maskedPhone = rawPhone.length > 6
        ? rawPhone.slice(0, 3) + '*'.repeat(rawPhone.length - 6) + rawPhone.slice(-3)
        : '**********';

    // Mask email: show first 2 chars and domain, rest asterisks
    const rawEmail = repair.customerEmail || '';
    let maskedEmail = '';
    if (rawEmail) {
        const [local, domain] = rawEmail.split('@');
        if (local && domain) {
            const maskedLocal = local.length > 2
                ? local.slice(0, 2) + '*'.repeat(local.length - 2)
                : local;
            maskedEmail = maskedLocal + '@' + domain;
        } else {
            maskedEmail = rawEmail;
        }
    }

    // Build public response (exclude sensitive fields)
    const publicRepair = {
        ticketId: repair.ticketId,
        deviceModel: repair.deviceModel,
        issueDescription: repair.issueDescription,
        status: repair.status,
        priority: repair.priority,
        dateLogged: repair.dateLogged,
        createdAt: repair.createdAt,
        updatedAt: repair.updatedAt,
        // Only include these if they exist
        assignedTo: repair.assignedTo || 'Unassigned',
        // Financials: only show payment status, not amounts
        paymentStatus: repair.financials?.paymentStatus || 'N/A',
        // Masked customer info
        maskedCustomer: {
            name: maskedName,
            phone: maskedPhone,
            email: maskedEmail,
        },
        // Do NOT include owner, financials.amountPaid, etc.
        // Also exclude any internal fields
    };

    // Add estimated completion date (simple: 2 business days from now)
    const estimatedCompletion = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    publicRepair.estimatedCompletion = estimatedCompletion.toISOString();

    res.json({
        success: true,
        repair: publicRepair,
    });
}));

module.exports = router;