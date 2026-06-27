import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database.js';
import { authenticateAdmin, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin Login (no auth required)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDatabase();

    // Find admin user
    const admin = db.prepare('SELECT * FROM users WHERE email = ? AND is_admin = 1').get(email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Verify password using bcrypt
    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate token using shared function
    const token = generateToken(admin);

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// All other admin routes require authentication
router.use(authenticateAdmin);

// Get platform statistics
router.get('/stats', (req, res) => {
  try {
    const db = getDatabase();
    
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0').get().count;
    const totalBalance = db.prepare('SELECT COALESCE(SUM(balance), 0) as sum FROM users WHERE is_admin = 0').get().sum;
    const frozenAccounts = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0 AND is_frozen = 1').get().count;
    const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawals WHERE status IN ('pending', 'processing')").get().count;
    const openTickets = db.prepare("SELECT COUNT(*) as count FROM support_tickets WHERE status = 'open'").get().count;

    res.json({
      stats: {
        totalUsers,
        totalBalance,
        frozenAccounts,
        pendingWithdrawals,
        openTickets
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get all users
router.get('/users', (req, res) => {
  try {
    const db = getDatabase();
    const search = req.query.search || '';
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let query = `
      SELECT id, name, email, balance, is_frozen, created_at, updated_at 
      FROM users WHERE is_admin = 0
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM users WHERE is_admin = 0';
    
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ?)`;
      countQuery += ` AND (name LIKE ? OR email LIKE ?)`;
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const users = search 
      ? db.prepare(query).all(`%${search}%`, `%${search}%`, limit, offset)
      : db.prepare(query).all(limit, offset);
    
    const total = search
      ? db.prepare(countQuery).get(`%${search}%`, `%${search}%`).count
      : db.prepare(countQuery).get().count;

    res.json({ users, total });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get single user
router.get('/users/:id', (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, email, balance, is_frozen, created_at, updated_at 
      FROM users WHERE id = ? AND is_admin = 0
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent transactions
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(req.params.id);

    // Get recent withdrawals
    const withdrawals = db.prepare(`
      SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(req.params.id);

    // Get support tickets
    const tickets = db.prepare(`
      SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(req.params.id);

    res.json({ user, transactions, withdrawals, tickets });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Adjust user balance
router.put('/users/:id/balance', [
  body('amount').isFloat().withMessage('Valid amount is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required for balance adjustment')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, reason } = req.body;
    const db = getDatabase();

    const user = db.prepare('SELECT id, balance FROM users WHERE id = ? AND is_admin = 0').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newBalance = user.balance + parseFloat(amount);
    
    // Update user balance
    db.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newBalance, req.params.id);

    // Create transaction record
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (?, 'adjustment', ?, ?)
    `).run(req.params.id, amount, `Admin adjustment: ${reason}`);

    res.json({ 
      message: 'Balance adjusted successfully',
      newBalance
    });
  } catch (error) {
    console.error('Adjust balance error:', error);
    res.status(500).json({ error: 'Failed to adjust balance' });
  }
});

// Toggle user frozen status
router.put('/users/:id/status', (req, res) => {
  try {
    const db = getDatabase();
    
    const user = db.prepare('SELECT id, is_frozen FROM users WHERE id = ? AND is_admin = 0').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = user.is_frozen ? 0 : 1;
    db.prepare('UPDATE users SET is_frozen = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, req.params.id);

    // Create transaction record
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (?, 'system', 0, ?)
    `).run(req.params.id, newStatus ? 'Account frozen by admin' : 'Account unfrozen by admin');

    res.json({ 
      message: newStatus ? 'User frozen successfully' : 'User unfrozen successfully',
      is_frozen: newStatus
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get all withdrawals
router.get('/withdrawals', (req, res) => {
  try {
    const db = getDatabase();
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let query = `
      SELECT w.*, u.name as user_name, u.email as user_email 
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM withdrawals';
    
    if (status) {
      query += ' WHERE w.status = ?';
      countQuery += ' WHERE status = ?';
    }
    
    query += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?';

    const withdrawals = status
      ? db.prepare(query).all(status, limit, offset)
      : db.prepare(query).all(limit, offset);
    
    const total = status
      ? db.prepare(countQuery).get(status).count
      : db.prepare(countQuery).get().count;

    res.json({ withdrawals, total });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Failed to get withdrawals' });
  }
});

// Approve/Reject withdrawal
router.put('/withdrawals/:id', [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('adminNote').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNote } = req.body;
    const db = getDatabase();

    const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    if (withdrawal.status === 'approved' || withdrawal.status === 'rejected') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    if (status === 'approved') {
      // Deduct balance from user when admin approves
      const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(withdrawal.user_id);
      db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?')
        .run(withdrawal.amount, withdrawal.user_id);

      // Update transaction from pending to actual withdrawal
      db.prepare(`
        UPDATE transactions SET type = 'withdrawal', description = ? WHERE reference = ?
      `).run(`Withdrawal #${req.params.id} approved`, `WD-${req.params.id}`);
    }
    
    if (status === 'rejected') {
      // Just mark as rejected, no balance was deducted yet (fee was paid externally)
      // Update the pending transaction to show rejection
      db.prepare(`
        UPDATE transactions SET type = 'withdrawal_rejected', description = ? WHERE reference = ?
      `).run(`Withdrawal #${req.params.id} rejected`, `WD-${req.params.id}`);
    }

    db.prepare(`
      UPDATE withdrawals SET status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, adminNote || null, req.params.id);

    res.json({ message: `Withdrawal ${status} successfully` });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get all support tickets
router.get('/tickets', (req, res) => {
  try {
    const db = getDatabase();
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email 
      FROM support_tickets t
      JOIN users u ON t.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM support_tickets';
    
    if (status) {
      query += ' WHERE t.status = ?';
      countQuery += ' WHERE status = ?';
    }
    
    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';

    const tickets = status
      ? db.prepare(query).all(status, limit, offset)
      : db.prepare(query).all(limit, offset);
    
    const total = status
      ? db.prepare(countQuery).get(status).count
      : db.prepare(countQuery).get().count;

    res.json({ tickets, total });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Reply to support ticket
router.put('/tickets/:id', [
  body('reply').trim().notEmpty().withMessage('Reply is required'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reply, status } = req.body;
    const db = getDatabase();

    const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updates = ['admin_reply = ?'];
    const params = [reply];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    params.push(req.params.id);

    db.prepare(`UPDATE support_tickets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...params);

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Get all settings
router.get('/settings', (req, res) => {
  try {
    const db = getDatabase();
    const settings = db.prepare('SELECT * FROM settings').all();
    
    const settingsObj = {};
    settings.forEach(setting => {
      if (setting.key === 'fee_payment_links') {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } else {
        settingsObj[setting.key] = setting.value;
      }
    });
    
    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update fee payment links
router.put('/settings/fee-links', [
  body('links').isArray().withMessage('Links must be an array'),
  body('links.*.name').notEmpty().withMessage('Each link must have a name'),
  body('links.*.url').notEmpty().withMessage('Each link must have a URL')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { links } = req.body;
    const db = getDatabase();

    db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run('fee_payment_links', JSON.stringify(links));

    res.json({ message: 'Fee payment links updated successfully' });
  } catch (error) {
    console.error('Update fee links error:', error);
    res.status(500).json({ error: 'Failed to update fee links' });
  }
});

// Update withdrawal fee percentage
router.put('/settings/fee-percent', [
  body('percent').isFloat({ min: 0, max: 100 }).withMessage('Fee percent must be between 0 and 100')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { percent } = req.body;
    const db = getDatabase();

    db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run('withdrawal_fee_percent', percent.toString());

    res.json({ message: 'Fee percent updated successfully' });
  } catch (error) {
    console.error('Update fee percent error:', error);
    res.status(500).json({ error: 'Failed to update fee percent' });
  }
});

export default router;
