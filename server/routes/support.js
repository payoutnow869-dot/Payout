import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create support ticket
router.post('/ticket', authenticateToken, [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, message, priority } = req.body;
    const db = getDatabase();

    const result = db.prepare(`
      INSERT INTO support_tickets (user_id, subject, message, priority, status)
      VALUES (?, ?, ?, ?, 'open')
    `).run(req.user.id, subject, message, priority || 'medium');

    res.status(201).json({ 
      message: 'Support ticket created successfully',
      ticketId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get user's tickets
router.get('/tickets', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const tickets = db.prepare(`
      SELECT id, subject, priority, status, admin_reply, created_at, updated_at 
      FROM support_tickets 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM support_tickets WHERE user_id = ?').get(req.user.id);

    res.json({ tickets, total: total.count });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Get single ticket
router.get('/tickets/:id', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const ticket = db.prepare(`
      SELECT * FROM support_tickets 
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

export default router;
