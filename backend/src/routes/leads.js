const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const VALID_SOURCES = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'];

// GET /api/leads — list leads with optional filters
router.get('/', (req, res) => {
  const { status, source, assigned_to, search } = req.query;

  let query = `
    SELECT l.*, u.name as assigned_name
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) { query += ' AND l.status = ?'; params.push(status); }
  if (source) { query += ' AND l.lead_source = ?'; params.push(source); }
  if (assigned_to) { query += ' AND l.assigned_to = ?'; params.push(assigned_to); }
  if (search) {
    query += ' AND (l.lead_name LIKE ? OR l.company_name LIKE ? OR l.email LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY l.updated_at DESC';

  try {
    const leads = db.prepare(query).all(...params);
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

// GET /api/leads/:id — single lead with notes
router.get('/:id', (req, res) => {
  const lead = db.prepare(`
    SELECT l.*, u.name as assigned_name
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    WHERE l.id = ?
  `).get(req.params.id);

  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  const notes = db.prepare(`
    SELECT n.*, u.name as created_by_name
    FROM notes n
    JOIN users u ON n.created_by = u.id
    WHERE n.lead_id = ?
    ORDER BY n.created_at DESC
  `).all(req.params.id);

  res.json({ lead, notes });
});

// POST /api/leads — create lead
router.post('/', (req, res) => {
  const { lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value } = req.body;

  if (!lead_name || !company_name || !email) {
    return res.status(400).json({ error: 'Lead name, company name, and email are required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO leads (lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      lead_name, company_name, email, phone || null,
      lead_source || 'Website', assigned_to || null,
      status || 'New', deal_value || 0
    );

    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ lead: newLead, message: 'Lead created successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lead.' });
  }
});

// PUT /api/leads/:id — update lead
router.put('/:id', (req, res) => {
  const { lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value } = req.body;

  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });

  try {
    db.prepare(`
      UPDATE leads SET
        lead_name = ?, company_name = ?, email = ?, phone = ?,
        lead_source = ?, assigned_to = ?, status = ?, deal_value = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      lead_name || existing.lead_name,
      company_name || existing.company_name,
      email || existing.email,
      phone !== undefined ? phone : existing.phone,
      lead_source || existing.lead_source,
      assigned_to !== undefined ? assigned_to : existing.assigned_to,
      status || existing.status,
      deal_value !== undefined ? deal_value : existing.deal_value,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT l.*, u.name as assigned_name
      FROM leads l LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
    `).get(req.params.id);

    res.json({ lead: updated, message: 'Lead updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead.' });
  }
});

// PATCH /api/leads/:id/status — quick status update
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` });
  }

  const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });

  db.prepare('UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, req.params.id);

  res.json({ message: 'Status updated.', status });
});

// DELETE /api/leads/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });

  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ message: 'Lead deleted successfully.' });
});

module.exports = router;