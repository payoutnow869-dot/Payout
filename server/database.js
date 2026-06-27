import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'payout.db');

let db;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDatabase() {
  const database = getDatabase();
  
  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      balance REAL DEFAULT 0.00,
      is_frozen INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      reset_token TEXT,
      reset_token_expires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create withdrawals table
  database.exec(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      fee_amount REAL DEFAULT 0,
      method TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending',
      admin_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create support tickets table
  database.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create settings table for admin configurable links
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default fee payment links
  const feeLinksExist = database.prepare('SELECT id FROM settings WHERE key = ?').get('fee_payment_links');
  if (!feeLinksExist) {
    const defaultLinks = JSON.stringify([
      { name: 'PayPal', url: 'https://paypal.me/admin' },
      { name: 'CashApp', url: 'https://cash.app/$admin' },
      { name: 'Zelle', url: 'mailto:admin@payout.com?subject=Withdrawal Fee Payment' },
      { name: 'Chime', url: 'mailto:admin@payout.com?subject=Withdrawal Fee Payment' },
      { name: 'Apple Pay', url: 'mailto:admin@payout.com?subject=Withdrawal Fee Payment' }
    ]);
    database.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('fee_payment_links', defaultLinks);
  }

  // Insert withdrawal fee percentage
  const feePercentExists = database.prepare('SELECT id FROM settings WHERE key = ?').get('withdrawal_fee_percent');
  if (!feePercentExists) {
    database.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('withdrawal_fee_percent', '20');
  }

  // Create admin user if not exists
  const adminExists = database.prepare('SELECT id FROM users WHERE email = ?').get('admin@payout.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    database.prepare(`
      INSERT INTO users (name, email, password, balance, is_admin)
      VALUES (?, ?, ?, ?, ?)
    `).run('Administrator', 'admin@payout.com', hashedPassword, 1000000, 1);
    console.log('Admin user created: admin@payout.com / admin123');
  }

  console.log('Database initialized successfully');
}
