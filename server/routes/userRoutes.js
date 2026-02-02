const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin, verifyStaff } = require('../middleware/authMiddleware');

// GET /api/users
// CHANGED: Now uses 'verifyStaff' so Managers can see the list too
router.get('/', verifyToken, verifyStaff, userController.getAllUsers);

// PUT /api/users/:id/role
// KEPT SAME: Still uses 'verifyAdmin' so only Admins can promote/demote
router.put('/:id/role', verifyToken, verifyAdmin, userController.updateUserRole);

module.exports = router;