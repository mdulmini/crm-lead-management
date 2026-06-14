const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// POST /api/notes — add note to a lead
router.post('/', (req, res) => {
  const { lead_id, content } = req.body;

  if (!lead_id || !content) {
    return res.status(400).json({ error: 'Lead ID and content are required.' });
  }

  const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(lead_id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  try {
    const result = db.prepare(`
      INSERT INTO notes (lead_id, content, created_by) VALUES (?, ?, ?)
    `).run(lead_id, content.trim(), req.user.id);

    // Update lead's updated_at
    db.prepare('UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(lead_id);

    const note = db.prepare(`
      SELECT n.*, u.name as created_by_name
      FROM notes n JOIN users u ON n.created_by = u.id
      WHERE n.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ note, message: 'Note added successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note.' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  // Only creator or admin can delete
  if (note.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this note.' });
  }

  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Note deleted.' });
});

module.exports = router;