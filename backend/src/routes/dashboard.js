const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/dashboard
router.get('/', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) as contacted_leads,
        SUM(CASE WHEN status = 'Qualified' THEN 1 ELSE 0 END) as qualified_leads,
        SUM(CASE WHEN status = 'Proposal Sent' THEN 1 ELSE 0 END) as proposal_leads,
        SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END) as won_leads,
        SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END) as lost_leads,
        SUM(deal_value) as total_deal_value,
        SUM(CASE WHEN status = 'Won' THEN deal_value ELSE 0 END) as won_deal_value
      FROM leads
    `).get();

    // Leads by source
    const bySource = db.prepare(`
      SELECT lead_source, COUNT(*) as count
      FROM leads GROUP BY lead_source ORDER BY count DESC
    `).all();

    // Recent leads (last 5)
    const recentLeads = db.prepare(`
      SELECT l.id, l.lead_name, l.company_name, l.status, l.deal_value, l.created_at, u.name as assigned_name
      FROM leads l LEFT JOIN users u ON l.assigned_to = u.id
      ORDER BY l.created_at DESC LIMIT 5
    `).all();

    // Salesperson performance
    const performance = db.prepare(`
      SELECT u.name, COUNT(l.id) as total, 
             SUM(CASE WHEN l.status='Won' THEN 1 ELSE 0 END) as won,
             SUM(CASE WHEN l.status='Won' THEN l.deal_value ELSE 0 END) as revenue
      FROM users u LEFT JOIN leads l ON u.id = l.assigned_to
      GROUP BY u.id ORDER BY revenue DESC
    `).all();

    res.json({ stats, bySource, recentLeads, performance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

module.exports = router;