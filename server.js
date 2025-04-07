const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

// Session store configuration
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Middleware
app.use(cors({
    origin: 'http://localhost:5000', // Update this with your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'templates' directory
app.use(express.static(path.join(__dirname, 'templates')));

// Session middleware
app.use(session({
    key: 'session_cookie_name',
    secret: 'abc34', // Change this to a secure secret
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: false, // Set to true in production with HTTPS
        httpOnly: true
    }
}));

// Routes
app.use('/api/auth', authRoutes);

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: 'Database connection successful', result: rows[0].result });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Protected route
app.get('/protected-route', authMiddleware.isAuthenticated, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

// Admin route
app.get('/admin-route', authMiddleware.isAdmin, (req, res) => {
    res.json({ message: 'This is an admin route' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Login page available at: http://localhost:${PORT}/login`);
});
