const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
}

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection failed", details: err.message });
    }
});

const ItemSchema = new mongoose.Schema({ id: String, name: String, qty: Number });
const RequestSchema = new mongoose.Schema({ id: String, user: String, itemId: String, itemName: String, qty: Number, status: String });

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);
const Request = mongoose.models.Request || mongoose.model('Request', RequestSchema);

app.get('/api/inventory', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

app.post('/api/inventory', async (req, res) => {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
});

app.put('/api/inventory/:id', async (req, res) => {
    const updated = await Item.findOneAndUpdate({ id: req.params.id }, { qty: req.body.qty }, { new: true });
    res.json(updated);
});

app.delete('/api/inventory/:id', async (req, res) => {
    await Item.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
});

app.get('/api/requests', async (req, res) => {
    const reqs = await Request.find();
    res.json(reqs);
});

app.post('/api/requests', async (req, res) => {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.json(newRequest);
});

app.put('/api/requests/:id', async (req, res) => {
    const updated = await Request.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    res.json(updated);
});

module.exports = app;