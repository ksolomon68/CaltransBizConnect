const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Root admin endpoint
router.get('/', (req, res) => {
    res.json({ message: 'Admin API is working' });
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    // For now, we'll use a simple header-based auth
    // In production, you'd use JWT tokens or sessions
    const adminEmail = req.headers['x-admin-email'];
    console.log(`Admin middleware: ${req.method} ${req.originalUrl}`);
    console.log(`Headers:`, req.headers);
    console.log(`Admin Email: ${adminEmail}`);

    const isAdminEmail = adminEmail && (adminEmail.includes('admin') || adminEmail === 'ks@evobrand.net');

    if (!isAdminEmail) {
        console.log('Admin access denied');
        return res.status(403).json({ error: 'Admin access required' });
    }
    console.log('Admin access granted');
    next();
};

// Get admin dashboard data
router.get('/dashboard', requireAdmin, (req, res) => {
    try {
        // Get stats
        const totalVendors = db.prepare("SELECT COUNT(*) as count FROM users WHERE type = 'vendor'").get().count;
        const totalAgencies = db.prepare("SELECT COUNT(*) as count FROM users WHERE type = 'agency'").get().count;
        const pendingApprovals = db.prepare("SELECT COUNT(*) as count FROM opportunities WHERE status = 'pending'").get().count;

        // Get pending opportunities
        const pendingOpportunities = db.prepare(`
            SELECT o.*, u.business_name as posted_by_name, u.email as posted_by_email
            FROM opportunities o
            LEFT JOIN users u ON o.posted_by = u.id
            WHERE o.status = 'pending'
            ORDER BY o.posted_date DESC
        `).all();

        // Get recent activity (simplified)
        const recentUsers = db.prepare(`
            SELECT email, type, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 5
        `).all();

        const recentActivity = recentUsers.map(user => ({
            type: user.type === 'vendor' ? 'user_reg' : 'agency_reg',
            user: user.email,
            time: formatRelativeTime(user.created_at)
        }));

        const data = {
            stats: {
                totalVendors,
                totalAgencies,
                pendingApprovals,
                siteUptime: '99.9%'
            },
            pendingOpportunities,
            recentActivity
        };

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users for management
router.get('/users', requireAdmin, (req, res) => {
    try {
        const users = db.prepare(`
            SELECT id, email, type, business_name, organization_name, contact_name, 
                   phone, ein, created_at
            FROM users
            ORDER BY created_at DESC
        `).all();

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user status
router.put('/users/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const stmt = db.prepare('UPDATE users SET status = ? WHERE id = ?');
        const result = stmt.run(status, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ id, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

module.exports = router;
