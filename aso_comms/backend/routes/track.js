const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');
const catchAsync = require('../utils/CatchAsync');

// ====== PUBLIC STATUS LOOKUP PAGE ======
router.get('/', (req, res) => {
    res.json('track/track');
});

// ====== PUBLIC STATUS RESULTS PAGE ======
router.get('/results', catchAsync(async (req, res) => {
    const { ticketId } = req.query;

    if (!ticketId || ticketId.trim() === "") {
        req.flash('error', 'Please enter a ticket ID to search.'); // 👈 ADD THIS
        return res.redirect('/track');
    }

    const repair = await Repair.findOne({ ticketId: ticketId.trim() });

    if (!repair) {
        req.flash('error', 'No active repair ticket found with that ID.'); // 👈 ADD THIS
        return res.redirect('/track');
    }

    // ====== 🔥 FIX: BUILD THE MASKED CUSTOMER OBJECT FOR PRIVACY ======
    // This turns "Alawode Heritage" into "A****** H*******" for public viewing
    const rawName = repair.customerName || "Valued Customer";
    const maskedName = rawName.split(' ').map(word => {
        if (word.length <= 1) return word;
        return word[0] + '*'.repeat(word.length - 1);
    }).join(' ');

    // This handles phone masking if your schema has a contact field, or provides a safe fallback
    const rawPhone = repair.customerPhone || "080XXXXXXXX";
    const maskedPhone = rawPhone.length > 4
        ? rawPhone.slice(0, 3) + '*'.repeat(rawPhone.length - 6) + rawPhone.slice(-3)
        : "**********";

    const maskedCustomer = {
        name: maskedName,
        phone: maskedPhone
    };
    // =================================================================

    // Pass BOTH repair and maskedCustomer to the template so it won't crash!
    res.json('track/status-view', { repair, maskedCustomer });
}));

module.exports = router;