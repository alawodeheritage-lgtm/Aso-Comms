// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => {
            // Dynamic folder based on upload type
            if (req.body.uploadType === 'repair') return 'aso-comms/repairs';
            if (req.body.uploadType === 'complaint') return 'aso-comms/complaints';
            if (req.body.uploadType === 'profile') return 'aso-comms/profiles';
            return 'aso-comms/general';
        },
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
        ],
        public_id: (req, file) => {
            // Generate unique filename
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            const originalName = file.originalname.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
            return `${originalName}-${timestamp}-${random}`;
        }
    }
});

// Multer instance with file size limits
const upload = require('multer')({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only images
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed.'), false);
        }
    }
});

// Helper functions
const uploadSingle = upload.single('file');
const uploadMultiple = upload.array('files', 10); // Max 10 files
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 },
    { name: 'document', maxCount: 1 }
]);

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId);
        // console.log('🗑️ Deleted from Cloudinary:', publicId);
        return result;
    } catch (error) {
        console.error('❌ Error deleting from Cloudinary:', error);
        return null;
    }
};

// Get secure URL
const getSecureUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

module.exports = {
    cloudinary,
    storage,
    upload,
    uploadSingle,
    uploadMultiple,
    uploadFields,
    deleteFromCloudinary,
    getSecureUrl
};