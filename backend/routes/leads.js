const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'leads.csv');

// Submit Lead
router.post('/', (req, res) => {
    const { name, email, phone, company, industry, goal, source, demoDate, demoTime } = req.body;
    const timestamp = new Date().toISOString();
    
    const clean = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
    
    const row = [
        timestamp,
        clean(name),
        clean(email),
        clean(phone),
        clean(company),
        clean(industry),
        clean(goal),
        clean(source),
        clean(demoDate),
        clean(demoTime)
    ].join(',') + '\n';
    
    fs.appendFile(DATA_PATH, row, (err) => {
        if (err) {
            console.error('Error saving lead:', err);
            return res.status(500).json({ error: 'Failed to save lead' });
        }
        res.json({ success: true, message: 'Lead captured successfully' });
    });
});

// Get Leads
router.get('/', (req, res) => {
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read leads' });
        
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');
        const result = lines.slice(1).map(line => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const obj = {};
            headers.forEach((header, i) => {
                let val = values[i] || '';
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
                obj[header] = val;
            });
            return obj;
        });
        
        res.json(result);
    });
});

module.exports = router;
