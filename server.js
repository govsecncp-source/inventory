const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Spin up local embedded MongoDB instance
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        // Connect Mongoose to the local embedded instance
        await mongoose.connect(uri);
        console.log('Connected to local embedded MongoDB successfully!');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

startServer();

// Define Database Schemas
const ItemSchema = new mongoose.Schema({
    id: String,
    name: String,
    qty: Number,
    minQty: Number
});

const RequestSchema = new mongoose.Schema({
    id: String,
    user: String,
    items: Array,
    status: String
});

const TransactionSchema = new mongoose.Schema({
    id: String,
    type: String,
    itemName: String,
    qty: Number,
    timestamp: String
});

const Item = mongoose.model('Item', ItemSchema);
const Request = mongoose.model('Request', RequestSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// API Routes
app.get('/api/data', async (req, res) => {
    try {
        const inventory = await Item.find();
        const requests = await Request.find();
        const transactions = await Transaction.find();
        res.json({ inventory, requests, transactions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        await Item.deleteMany({});
        const savedItems = await Item.insertMany(req.body);
        res.json(savedItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/requests', async (req, res) => {
    try {
        await Request.deleteMany({});
        const savedRequests = await Request.insertMany(req.body);
        res.json(savedRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const newTx = new Transaction(req.body);
        await newTx.save();
        res.json(newTx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});