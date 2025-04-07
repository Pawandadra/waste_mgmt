const md5 = require('md5');
const db = require('../config/db');

const authMiddleware = {
    // Verify user login
    verifyLogin: async (req, res, next) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        try {
            const [users] = await db.query(
                'SELECT * FROM users WHERE email = ? AND password = ?',
                [email, md5(password)]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = users[0];
            // Remove password from user object
            delete user.password;
            
            req.user = user;
            next();
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Check if user is authenticated
    isAuthenticated: (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    },

    // Check if user is admin
    isAdmin: (req, res, next) => {
        if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        next();
    },

    // Check if user is department
    isDepartment: (req, res, next) => {
        if (!req.session || !req.session.user || req.session.user.role !== 'department') {
            return res.status(403).json({ error: 'Forbidden: Department access required' });
        }
        next();
    },

    // Check if user is company
    isCompany: (req, res, next) => {
        if (!req.session || !req.session.user || req.session.user.role !== 'company') {
            return res.status(403).json({ error: 'Forbidden: Company access required' });
        }
        next();
    }
};

module.exports = authMiddleware; 