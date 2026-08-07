const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// In-memory data store for serverless execution
let memoryData = {
    inventory: [],
    requests: [],
    transactions: []
};

// API Endpoints
app.get('/api/data', (req, res) => {
    res.json(memoryData);
});

app.post('/api/inventory', (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            memoryData.inventory = req.body;
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/requests', (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            memoryData.requests = req.body;
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', (req, res) => {
    try {
        if (req.body) {
            memoryData.transactions.push(req.body);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export app for Vercel Serverless deployment, and run standard listen locally if not on Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;