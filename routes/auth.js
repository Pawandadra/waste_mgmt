const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const md5 = require('md5');
const db = require('../config/db');

// Login route
router.post('/login', authMiddleware.verifyLogin, async (req, res) => {
    try {
        // Set session
        req.session.user = req.user;
        
        // Get additional user information based on role
        let additionalInfo = {};
        if (req.user.role === 'department') {
            const [departments] = await db.query(
                'SELECT * FROM departments WHERE id = ?',
                [req.user.department_id]
            );
            additionalInfo.department = departments[0];
        } else if (req.user.role === 'company') {
            const [companies] = await db.query(
                'SELECT * FROM companies WHERE email = ?',
                [req.user.email]
            );
            additionalInfo.company = companies[0];
        }

        res.json({
            message: 'Login successful',
            user: {
                ...req.user,
                ...additionalInfo
            }
        });
    } catch (error) {
        console.error('Session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out, please try again' });
        }
        res.clearCookie('session_cookie_name');
        res.json({ message: 'Logged out successfully' });
    });
});

// Check authentication status
router.get('/check-auth', authMiddleware.isAuthenticated, (req, res) => {
    res.json({ 
        authenticated: true,
        user: req.session.user
    });
});

module.exports = router; 