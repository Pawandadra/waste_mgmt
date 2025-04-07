const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../config/db');

// Add new company
router.post('/add', authMiddleware.isAdmin, async (req, res) => {
    try {
        const { name, email, phone_no, contract_start, contract_end } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone_no || !contract_start || !contract_end) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert company into database
        const [result] = await db.query(
            'INSERT INTO companies (name, email, phone_no, contract_start, contract_end) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone_no, contract_start, contract_end]
        );

        res.json({
            message: 'Company added successfully',
            companyId: result.insertId
        });
    } catch (error) {
        console.error('Add company error:', error);
        res.status(500).json({ error: 'Failed to add company' });
    }
});

// Get all companies
router.get('/all', authMiddleware.isAdmin, async (req, res) => {
    try {
        const [companies] = await db.query('SELECT * FROM companies');
        res.json(companies);
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

module.exports = router; 