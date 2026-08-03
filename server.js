const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Database Schemas
const ItemSchema = new mongoose.Schema({
    id: String,
    name: String,
    qty: Number
});

const RequestSchema = new mongoose.Schema({
    id: String,
    user: String,
    itemId: String,
    itemName: String,
    qty: Number,
    status: String
});

const Item = mongoose.model('Item', ItemSchema);
const Request = mongoose.model('Request', RequestSchema);

// API Endpoints
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
    const newReq = new Request(req.body);
    await newReq.save();
    res.json(newReq);
});

app.put('/api/requests/:id', async (req, res) => {
    const updated = await Request.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    res.json(updated);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));