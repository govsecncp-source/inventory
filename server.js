const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Sequelize with connection pooling parameters for serverless
let sequelize;

function getSequelizeInstance() {
    if (!sequelize) {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            pool: {
                max: 2,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });
    }
    return sequelize;
}

// Define Models dynamically per request or lazily
let modelsInitialized = false;
let InventoryItem, RequestItem, Transaction;

function initModels(seq) {
    if (modelsInitialized) return;
    
    InventoryItem = seq.define('InventoryItem', {
        itemId: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING },
        qty: { type: DataTypes.INTEGER },
        minQty: { type: DataTypes.INTEGER }
    });

    RequestItem = seq.define('RequestItem', {
        requestId: { type: DataTypes.STRING, primaryKey: true },
        user: { type: DataTypes.STRING },
        items: { type: DataTypes.JSON },
        status: { type: DataTypes.STRING }
    });

    Transaction = seq.define('Transaction', {
        transactionId: { type: DataTypes.STRING, primaryKey: true },
        type: { type: DataTypes.STRING },
        itemName: { type: DataTypes.STRING },
        qty: { type: DataTypes.INTEGER },
        timestamp: { type: DataTypes.STRING }
    });

    modelsInitialized = true;
}

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
    try {
        const seq = getSequelizeInstance();
        initModels(seq);
        await seq.authenticate();
        next();
    } catch (err) {
        console.error('Database connection middleware error:', err);
        res.status(500).json({ error: 'Database connection failed: ' + err.message });
    }
});

// API Endpoints
app.get('/api/data', async (req, res) => {
    try {
        const inventory = await InventoryItem.findAll();
        const requests = await RequestItem.findAll();
        const transactions = await Transaction.findAll();
        res.json({ inventory, requests, transactions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        await InventoryItem.destroy({ truncate: true });
        if (Array.isArray(req.body) && req.body.length > 0) {
            await InventoryItem.bulkCreate(req.body);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/requests', async (req, res) => {
    try {
        await RequestItem.destroy({ truncate: true });
        if (Array.isArray(req.body) && req.body.length > 0) {
            await RequestItem.bulkCreate(req.body);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        await Transaction.create(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;