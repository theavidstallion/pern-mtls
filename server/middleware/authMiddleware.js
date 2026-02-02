const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

// STRICT: Only Admins (For changing roles)
exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Admins Only" });
    }
};

// OPEN: Managers AND Admins (For viewing lists)
exports.verifyStaff = (req, res, next) => {
    if (req.user && ['Admin', 'Manager'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Staff Only" });
    }
};