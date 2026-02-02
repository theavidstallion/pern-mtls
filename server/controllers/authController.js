const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client'); // Import once
const axios = require('axios'); // Required for Keycloak

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// HELPER: Log Activity
const logActivity = async (action, email, details = "") => {
    try {
        await prisma.log.create({
            data: { action, email, details }
        });
    } catch (err) {
        console.error("Logging failed:", err); // Don't crash app if logging fails
    }
};

// Helper: Generate Tokens
const generateTokens = (user) => {
    // 1. Access Token (Short life: 15 mins)
    const accessToken = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    // 2. Refresh Token (Long life: 7 days)
    const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

// SIGNUP
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in DB
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'User' // Default role
            }
        });
        await logActivity('SIGNUP', newUser.email, 'Local Registration');

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Send Refresh Token as HttpOnly Cookie (Secure!)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // true because we are using https
            sameSite: 'None', // Required for cross-origin (React -> Node)
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        await logActivity('LOGIN', user.email, 'Local Login');
        // Send Access Token as JSON
        res.json({ accessToken, user: { email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: "Logged out" });
};

// GET ALL USERS (Admin Only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, provider: true, createdAt: true } 
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// FINAL SYNC VERSION: "Sync on Create Only"
exports.keycloakLogin = async (req, res) => {
    try {
        const { code } = req.body;
        
        // 1. Get Tokens from Keycloak
        const tokenResponse = await fetch('http://127.0.0.1:8080/realms/quantrust-realm/protocol/openid-connect/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: 'quantrust-app',
                client_secret: 'DGlYNioqtIW37PinfAtHVnLYK2YMlZ6G',
                code: code,
                redirect_uri: 'http://localhost:5173/auth/callback',
                scope: 'openid profile email'
            })
        });

        if (!tokenResponse.ok) return res.status(401).json({ message: "Keycloak Token Failed" });

        const tokenData = await tokenResponse.json();
        
        // 2. Decode Tokens
        const idToken = jwt.decode(tokenData.id_token);
        const accessToken = jwt.decode(tokenData.access_token); 

        // 3. Extract Email & Role
        const userEmail = idToken.email;
        const keycloakRoles = accessToken.realm_access?.roles || [];
        
        // Determine what role Keycloak *would* give them (for new users)
        const syncedRole = keycloakRoles.includes('Admin') ? 'Admin' : 'User';
        
        console.log(`SSO Login: ${userEmail}`);

        // 4. UPSERT (Update if exists, Create if new)
        const user = await prisma.user.upsert({
            where: { email: userEmail },
            
            // CASE A: User Exists
            // We DO NOT update the role. We trust the local DB role.
            update: { 
                provider: 'keycloak' 
                // role: syncedRole  <--- THIS IS REMOVED so local admins stay admins
            },

            // CASE B: User is New
            // We use the Keycloak role for their first login.
            create: {
                email: userEmail,
                role: syncedRole, 
                provider: 'keycloak'
            }
        });

        // 5. Generate Session
        const { accessToken: localToken, refreshToken } = generateTokens(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000
        });

        await logActivity('LOGIN', user.email, 'Keycloak SSO');
        res.json({ accessToken: localToken, user: { email: user.email, role: user.role } });

    } catch (error) {
        console.error("SSO Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// REFRESH / RESTORE SESSION
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: "No session" });

        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(401).json({ message: "User not found" });

        const { accessToken } = generateTokens(user);

        res.json({ 
            accessToken, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                provider: user.provider 
            } 
        });

    } catch (error) {
        return res.status(403).json({ message: "Invalid Session" });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await prisma.log.findMany({
            orderBy: { createdAt: 'desc' }, // Newest first
            take: 100 // Limit to last 100 logs
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching logs" });
    }
};