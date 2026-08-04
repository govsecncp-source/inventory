const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serverless MongoDB Connection Caching
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

// Middleware to ensure database connection before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection failed", details: err.message });
    }
});

// Schemas & Models
const ItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, default: 0 }
});

const RequestSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user: { type: String, required: true },
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    qty: { type: Number, required: true },
    status: { type: String, required: true, default: 'Pending' }
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);
const Request = mongoose.models.Request || mongoose.model('Request', RequestSchema);

// Root Route (Fixes "Cannot GET /")
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Inventory API is running successfully!' });
});

// Inventory Routes
app.get('/api/inventory', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch inventory", details: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: "Failed to create item", details: err.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const updated = await Item.findOneAndUpdate(
            { id: req.params.id }, 
            { qty: req.body.qty }, 
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: "Item not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: "Failed to update item", details: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        const deleted = await Item.findOneAndDelete({ id: req.params.id });
        if (!deleted) return res.status(404).json({ error: "Item not found" });
        res.status(200).json({ success: true, message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete item", details: err.message });
    }
});

// Request Routes
app.get('/api/requests', async (req, res) => {
    try {
        const reqs = await Request.find();
        res.status(200).json(reqs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch requests", details: err.message });
    }
});

app.post('/api/requests', async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(400).json({ error: "Failed to create request", details: err.message });
    }
});

app.put('/api/requests/:id', async (req, res) => {
    try {
        const updated = await Request.findOneAndUpdate(
            { id: req.params.id }, 
            { status: req.body.status }, 
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: "Request not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: "Failed to update request", details: err.message });
    }
});

module.exports = app;