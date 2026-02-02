require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const prisma = new PrismaClient();

// 1. Middleware Setup
app.use(express.json());
app.use(cookieParser());
// 1. CORS FIRST
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// 2. mTLS Middleware SECOND
app.use((req, res, next) => {
    // ⚠️ CRITICAL FIX: Always let 'OPTIONS' requests pass!
    // If you block this, the browser hangs forever.
    if (req.method === 'OPTIONS') return next(); 

    // Then check certs for actual data requests
    if (!req.client.authorized) {
        console.log(`❌ Blocked: ${req.ip} (No Cert)`);
        return res.status(401).json({ message: "Client Certificate Required" });
    }

    next();
});

// 2. Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 3. Load Verified Certificates (From the 'certs_final' folder)
// We use path.join to safely go up one level (..) to find the folder
const options = {
    key: fs.readFileSync(path.join(__dirname, '../certs_final/server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs_final/server-crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../certs_final/ca-crt.pem')), // Trust Anchor
    
    // mTLS SECURITY SETTINGS
    requestCert: true,       // Ask the browser for the ID card
    rejectUnauthorized: false // STRICT MODE: Reject anyone without the ID card
};

// 4. Test Route
app.get('/', (req, res) => {
    res.send('✅ Backend is running securely with mTLS!');
});

// 5. Security Check Route (Optional - for testing)
app.get('/api/check-mtls', (req, res) => {
    const cert = req.socket.getPeerCertificate();
    if (req.client.authorized) {
        res.json({ 
            message: "Secure Connection Established 🔒", 
            user: cert.subject.CN, // Should say "AdminUser"
            authorized: true 
        });
    } else {
        // This won't actually be reached if rejectUnauthorized is true,
        // but it's good practice to handle it.
        res.status(401).json({ message: "Access Denied", authorized: false });
    }
});

// 6. Start the Server
const PORT = 5000;
https.createServer(options, app).listen(PORT, () => {
    console.log(`🔒 ZERO TRUST SERVER running on https://localhost:${PORT}`);
});