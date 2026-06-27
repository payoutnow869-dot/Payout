import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get withdrawal fee info and payment links
router.get('/fee-info', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    
    // Get fee percentage from settings
    const feePercentRow = db.prepare("SELECT value FROM settings WHERE key = 'withdrawal_fee_percent'").get();
    const feePercent = feePercentRow ? parseFloat(feePercentRow.value) : 20;
    
    // Get fee payment links from settings
    const feeLinksRow = db.prepare("SELECT value FROM settings WHERE key = 'fee_payment_links'").get();
    const feeLinks = feeLinksRow ? JSON.parse(feeLinksRow.value) : [];
    
    res.json({ 
      feePercent,
      feePaymentLinks: feeLinks
    });
  } catch (error) {
    console.error('Get fee info error:', error);
    res.status(500).json({ error: 'Failed to get fee information' });
  }
});

// Calculate fee for a given amount
router.post('/calculate-fee', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const db = getDatabase();
    
    // Get fee percentage from settings
    const feePercentRow = db.prepare("SELECT value FROM settings WHERE key = 'withdrawal_fee_percent'").get();
    const feePercent = feePercentRow ? parseFloat(feePercentRow.value) : 20;
    
    const feeAmount = amount * (feePercent / 100);
    
    // Get user's current balance
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);
    
    res.json({
      originalAmount: parseFloat(amount),
      feePercent,
      feeAmount: parseFloat(feeAmount.toFixed(2)),
      userBalance: user.balance,
      canWithdraw: user.balance >= parseFloat(amount) // Only check withdrawal amount, not fee
    });
  } catch (error) {
    console.error('Calculate fee error:', error);
    res.status(500).json({ error: 'Failed to calculate fee' });
  }
});

// Create withdrawal request
router.post('/', authenticateToken, [
  body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal is $10'),
  body('method').isIn(['bank_transfer', 'crypto', 'paypal', 'cashapp', 'zelle', 'chime', 'apple_pay']).withMessage('Invalid payment method'),
  body('details').notEmpty().withMessage('Payment details are required'),
  body('feePaid').isBoolean().withMessage('Fee payment confirmation required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, details, note, feePaid } = req.body;
    const db = getDatabase();

    // Check if user is frozen
    const user = db.prepare('SELECT balance, is_frozen FROM users WHERE id = ?').get(req.user.id);
    if (user.is_frozen) {
      return res.status(403).json({ error: 'Your account is frozen. Contact support.' });
    }

    if (!feePaid) {
      return res.status(400).json({ error: 'Please confirm that you have paid the withdrawal fee' });
    }

    // Get fee percentage from settings
    const feePercentRow = db.prepare("SELECT value FROM settings WHERE key = 'withdrawal_fee_percent'").get();
    const feePercent = feePercentRow ? parseFloat(feePercentRow.value) : 20;
    
    const feeAmount = parseFloat(amount) * (feePercent / 100);

    // Check balance - only check withdrawal amount, fee is paid externally
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal request with status 'processing' (fee paid externally, waiting for admin approval)
    const result = db.prepare(`
      INSERT INTO withdrawals (user_id, amount, fee_amount, method, details, status)
      VALUES (?, ?, ?, ?, ?, 'processing')
    `).run(req.user.id, amount, feeAmount.toFixed(2), method, details);

    // Create a pending transaction record (will be updated when admin approves)
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description, reference)
      VALUES (?, 'withdrawal_pending', ?, ?, ?)
    `).run(req.user.id, -parseFloat(amount), `Withdrawal request #${result.lastInsertRowid}${note ? ` - ${note}` : ''}`, `WD-${result.lastInsertRowid}`);

    res.status(201).json({ 
      message: 'Withdrawal submitted! Fee paid externally. Awaiting admin approval.',
      withdrawalId: result.lastInsertRowid,
      amount: parseFloat(amount),
      feeAmount: parseFloat(feeAmount.toFixed(2)),
      status: 'processing'
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ error: 'Failed to create withdrawal request' });
  }
});

// Get withdrawal history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const withdrawals = db.prepare(`
      SELECT * FROM withdrawals 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM withdrawals WHERE user_id = ?').get(req.user.id);

    res.json({ withdrawals, total: total.count });
  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({ error: 'Failed to get withdrawal history' });
  }
});

// Get single withdrawal
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const withdrawal = db.prepare(`
      SELECT * FROM withdrawals 
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    res.json({ withdrawal });
  } catch (error) {
    console.error('Get withdrawal error:', error);
    res.status(500).json({ error: 'Failed to get withdrawal' });
  }
});

export default router;
