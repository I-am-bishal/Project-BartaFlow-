const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const healthRoutes = require('./routes/health');
const leadsRoutes = require('./routes/leads');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── DATABASE (CSV) INITIALIZATION ──────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const DATA_PATH = path.join(DATA_DIR, 'leads.csv');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, 'timestamp,name,email,phone,company,industry,goal,source,demoDate,demoTime\n');
}

// ── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/leads', leadsRoutes);

app.listen(PORT, () => {
    console.log(`🚀 BartaFlow Backend running on http://localhost:${PORT}`);
});
