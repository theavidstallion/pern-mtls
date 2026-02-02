const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Users (to display in the table)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { 
                id: true, 
                email: true, 
                role: true, 
                provider: true, 
                createdAt: true 
            },
            orderBy: { id: 'asc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Security: Ensure role is valid
    if (!['Admin', 'Manager', 'User'].includes(role)) {
        return res.status(400).json({ message: "Invalid role." });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role: role }
        });
        res.json({ message: `Role updated to ${role}`, user: updatedUser });
    } catch (error) {
        console.error("Update Role Error:", error);
        res.status(500).json({ message: "Failed to update role" });
    }
};