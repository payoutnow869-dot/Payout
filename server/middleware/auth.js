import jwt from 'jsonwebtoken';
import { getDatabase } from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'payout-secret-key-change-in-production';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    const db = getDatabase();
    const user = db.prepare('SELECT id, name, email, balance, is_frozen, is_admin FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

export function authenticateAdmin(req, res, next) {
  const token = req.cookies.adminToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    
    if (!decoded.is_admin) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const db = getDatabase();
    const admin = db.prepare('SELECT id, name, email, is_admin FROM users WHERE id = ? AND is_admin = 1').get(decoded.id);
    
    if (!admin) {
      return res.status(403).json({ error: 'Admin not found.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}
