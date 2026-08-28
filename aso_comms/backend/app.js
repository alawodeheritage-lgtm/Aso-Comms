// app.js
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// ==============================================
// IMPORT ALL ROUTES
// ==============================================
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const repairRoutes = require('./routes/repairs');
const expenseRoutes = require('./routes/expenses');
const trackRoutes = require('./routes/track');
const transactionRoutes = require('./routes/transactions');
const complaintRoutes = require('./routes/complaints');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');

// ==============================================
// CONNECT TO MONGODB
// ==============================================
const dbUrl = process.env.DATABASE_URL;
mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 30000
})
    .then(() => console.log("✅ DATABASE: Securely connected to Atlas!"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

const app = express();

// ✅ TRUST PROXY - REQUIRED FOR RENDER
app.set('trust proxy', 1);

// ==============================================
// ✅ MONGODB SESSION STORE
// ==============================================
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600
});

store.on('error', function (error) {
    console.log('❌ Session Store Error:', error);
});

// ==============================================
// ✅ CORS CONFIGURATION
// ==============================================
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://aso-comms-six.vercel.app',
    'https://asocomms.vercel.app',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie', 'Cookie'],
};

app.use(cors(corsOptions));

// ==============================================
// ✅ SESSION CONFIGURATION
// ==============================================
const isProduction = process.env.NODE_ENV === 'production';
const sessionConfig = {
    store: store,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
};

app.use(session(sessionConfig));
app.use(flash());

// ==============================================
// PASSPORT
// ==============================================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==============================================
// MIDDLEWARE
// ==============================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(methodOverride('_method'));

// ==============================================
// ✅ REQUEST LOGGING MIDDLEWARE
// ==============================================
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log(`🍪 Cookies:`, req.headers.cookie || 'None');
    console.log(`🔑 Authenticated: ${req.isAuthenticated()}`);
    next();
});

// ==============================================
// ✅ TEST ROUTE
// ==============================================
app.get('/api/test', (req, res) => {
    res.json({
        message: 'CORS is working! 🎉',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin',
        authenticated: req.isAuthenticated(),
        sessionId: req.sessionID
    });
});

// ==============================================
// CURRENT USER ROUTE
// ==============================================
app.get('/api/current-user', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user.toObject ? req.user.toObject() : req.user;
        delete user.hash;
        delete user.salt;
        delete user.otpCode;
        delete user.otpExpires;

        return res.json({
            success: true,
            user: user,
            isAuthenticated: true
        });
    }
    return res.status(401).json({
        success: false,
        isAuthenticated: false,
        error: 'Not authenticated'
    });
});

// ==============================================
// 👇 MOUNT ALL ROUTES - API ROUTES FIRST
// ==============================================

// 1️⃣ API ROUTES
app.use('/uploads', uploadRoutes);
app.use('/repairs', repairRoutes);
app.use('/expenses', expenseRoutes);
app.use('/complaints', complaintRoutes);
app.use('/transactions', transactionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/track', trackRoutes);

// 2️⃣ AUTH & USER ROUTES
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);

// ==============================================
// LANDING
// ==============================================
app.get('/', (req, res) => {
    res.json({
        message: 'AsoComms API is running!',
        endpoints: {
            auth: '/login, /register, /verify-otp, /forgot-password, /reset-password',
            repairs: '/repairs',
            expenses: '/expenses',
            complaints: '/complaints',
            track: '/track',
            transactions: '/transactions'
        }
    });
});

// ==============================================
// 👇 ERROR HANDLING
// ==============================================
app.all('/*', (req, res, next) => {
    next(new ExpressError('Page Not Found / Resource Missing', 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong!' } = err;

    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate record found in the system.';
    }

    console.error('❌ Error:', err);

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        timestamp: new Date().toISOString()
    });
});

// ==============================================
// START SERVER
// ==============================================
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 AsoComms API running on port ${port}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});