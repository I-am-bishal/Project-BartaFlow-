const express = require('express');
const router = express.Router();

// Health Check
router.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;
