const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../config/db');

// Add new department
router.post('/add', authMiddleware.isAdmin, async (req, res) => {
    try {
        const { dept_name, dept_code, contact_info } = req.body;
        
        // Validate required fields
        if (!dept_name || !dept_code || !contact_info) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert department into database
        const [result] = await db.query(
            'INSERT INTO departments (dept_name, dept_code, contact_info) VALUES (?, ?, ?)',
            [dept_name, dept_code, contact_info]
        );

        res.json({
            message: 'Department added successfully',
            departmentId: result.insertId
        });
    } catch (error) {
        console.error('Add department error:', error);
        res.status(500).json({ error: 'Failed to add department' });
    }
});

// Get all departments
router.get('/all', authMiddleware.isAdmin, async (req, res) => {
    try {
        const [departments] = await db.query('SELECT * FROM departments');
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

module.exports = router; 