const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Middleware: Verify Token & Check Admin Role
const requireAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'Admin') {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/users', requireAdmin, authController.getAllUsers);
router.post('/keycloak', authController.keycloakLogin);
router.get('/refresh', authController.refreshToken);
router.get('/logs', verifyToken, verifyAdmin, authController.getLogs);

module.exports = router;