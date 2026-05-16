const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── DATABASE (CSV) ──────────────────────────────────────────────────────────
const DATA_PATH = path.join(__dirname, 'data', 'leads.csv');

// Ensure data directory and file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(DATA_PATH)) {
    // Comprehensive headers for marketing & sales
    fs.writeFileSync(DATA_PATH, 'timestamp,name,email,phone,company,industry,goal,source,demoDate,demoTime\n');
}

// ── ROUTES ──────────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Submit Lead
app.post('/api/leads', (req, res) => {
    const { name, email, phone, company, industry, goal, source, demoDate, demoTime } = req.body;
    const timestamp = new Date().toISOString();
    
    // Sanitize values for CSV (escape quotes)
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

// Get Leads (JSON format)
app.get('/api/leads', (req, res) => {
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read leads' });
        
        // Convert CSV to JSON for frontend ease
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');
        const result = lines.slice(1).map(line => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Regex to split by comma but ignore commas inside quotes
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

app.listen(PORT, () => {
    console.log(`🚀 BartaFlow Backend running on http://localhost:${PORT}`);
});
