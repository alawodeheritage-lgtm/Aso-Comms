// backend/routes/uploads.js
const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, deleteFromCloudinary } = require('../config/cloudinary');
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// Upload single file
router.post('/single', isLoggedIn, catchAsync(async (req, res) => {
    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // console.log('📤 File uploaded:', req.file);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                url: req.file.path,
                publicId: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                format: req.file.format,
                uploadedAt: new Date().toISOString()
            }
        });
    });
}));

// Upload multiple files
// backend/routes/uploads.js
router.post('/multiple', isLoggedIn, catchAsync(async (req, res) => {
    // console.log('📤 Upload multiple files request received');
    // console.log('📤 Files:', req.files);

    uploadMultiple(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ error: err.message });
        }

        // console.log('📤 Files after upload:', req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files.map(file => ({
            url: file.path,
            publicId: file.filename,
            originalName: file.originalname,
            size: file.size,
            format: file.format,
            uploadedAt: new Date().toISOString()
        }));

        // console.log(`📤 ${files.length} files uploaded to Cloudinary`);
        // console.log('📤 Files:', files);

        res.json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            files: files
        });
    });
}));

// Delete file from Cloudinary
router.delete('/:publicId', isLoggedIn, catchAsync(async (req, res) => {
    const { publicId } = req.params;

    const result = await deleteFromCloudinary(publicId);

    if (!result) {
        return res.status(404).json({ error: 'File not found or already deleted' });
    }

    res.json({
        success: true,
        message: 'File deleted successfully',
        result: result
    });
}));

module.exports = router;