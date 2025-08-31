// test-blockchain-api.js - A simple API server to simulate blockchain interaction
// Run with: node test-blockchain-api.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3002; // Changed from 3001 to 3002

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test data to simulate blockchain responses
const testPhones = {
    "+1-202-555-0101": "Federal Bureau of Investigation",
    "+1-202-555-0102": "Department of Homeland Security",
    "+1-202-555-0103": "Internal Revenue Service"
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Test Blockchain API running',
        endpoints: {
            '/verify/:phoneNumber': 'Verify if a phone number belongs to a government agency',
            '/agency/:phoneNumber': 'Get agency name for a phone number',
            '/status': 'Get API and simulated blockchain status'
        }
    });
});

// Verify phone number endpoint
app.get('/verify/:phoneNumber', (req, res) => {
    const { phoneNumber } = req.params;
    const isVerified = testPhones[phoneNumber] !== undefined;
    
    // Simulate network delay
    setTimeout(() => {
        res.json({
            phoneNumber,
            verified: isVerified,
            timestamp: new Date().toISOString()
        });
    }, 500);
});

// Get agency name endpoint
app.get('/agency/:phoneNumber', (req, res) => {
    const { phoneNumber } = req.params;
    const agencyName = testPhones[phoneNumber];
    
    // Simulate network delay
    setTimeout(() => {
        if (agencyName) {
            res.json({
                phoneNumber,
                agencyName,
                verified: true,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).json({
                phoneNumber,
                error: 'Phone number not registered to any government agency',
                verified: false,
                timestamp: new Date().toISOString()
            });
        }
    }, 500);
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        apiStatus: 'online',
        blockchainStatus: 'connected',
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        registeredPhones: Object.keys(testPhones).length,
        networkName: 'localhost (simulated)',
        timestamp: new Date().toISOString()
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Test Blockchain API server running at http://localhost:${port}`);
    console.log('Available test phone numbers:');
    Object.entries(testPhones).forEach(([phone, agency]) => {
        console.log(`  ${phone} - ${agency}`);
    });
});
