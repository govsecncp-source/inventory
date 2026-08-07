const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection (Supports both local and cloud MongoDB Atlas via process.env.MONGO_URI)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventoryDB';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('Connected to MongoDB successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Schemas & Models
const inventorySchema = new mongoose.Schema({
    id: String,
    name: String,
    qty: Number,
    minQty: Number
});

const requestSchema = new mongoose.Schema({
    id: String,
    user: String,
    items: Array,
    status: String
});

const transactionSchema = new mongoose.Schema({
    id: String,
    type: String,
    itemName: String,
    qty: Number,
    timestamp: String
});

const InventoryItem = mongoose.model('InventoryItem', inventorySchema);
const RequestItem = mongoose.model('RequestItem', requestSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// API Endpoints
app.get('/api/data', async (req, res) => {
    try {
        const inventory = await InventoryItem.find({});
        const requests = await RequestItem.find({});
        const transactions = await Transaction.find({});
        res.json({ inventory, requests, transactions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        await InventoryItem.deleteMany({});
        if (Array.isArray(req.body) && req.body.length > 0) {
            await InventoryItem.insertMany(req.body);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/requests', async (req, res) => {
    try {
        await RequestItem.deleteMany({});
        if (Array.isArray(req.body) && req.body.length > 0) {
            await RequestItem.insertMany(req.body);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const newTx = new Transaction(req.body);
        await newTx.save();
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