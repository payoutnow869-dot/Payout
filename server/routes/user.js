import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, email, balance, is_frozen, is_admin, created_at 
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const db = getDatabase();

    db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name, req.user.id);

    const user = db.prepare(`
      SELECT id, name, email, balance, is_frozen, is_admin 
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get balance
router.get('/balance', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT balance, is_frozen FROM users WHERE id = ?').get(req.user.id);
    res.json({ balance: user.balance, is_frozen: !!user.is_frozen });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Get transactions
router.get('/transactions', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?').get(req.user.id);

    res.json({ transactions, total: total.count });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

export default router;
