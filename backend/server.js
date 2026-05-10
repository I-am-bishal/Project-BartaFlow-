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
    fs.writeFileSync(DATA_PATH, 'date,name,email,service,message\n');
}

// ── ROUTES ──────────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Submit Lead
app.post('/api/leads', (req, res) => {
    const { name, email, service, message } = req.body;
    const date = new Date().toISOString();
    const row = `${date},"${name}","${email}","${service}","${message}"\n`;
    
    fs.appendFile(DATA_PATH, row, (err) => {
        if (err) {
            console.error('Error saving lead:', err);
            return res.status(500).json({ error: 'Failed to save lead' });
        }
        res.json({ success: true, message: 'Lead saved successfully' });
    });
});

// Get Leads
app.get('/api/leads', (req, res) => {
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read leads' });
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 BartaFlow Backend running on http://localhost:${PORT}`);
});
