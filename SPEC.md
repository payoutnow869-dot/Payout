# Payout - User & Admin Platform Specification

## 1. Project Overview

**Project Name:** Payout Platform  
**Type:** Full-stack Web Application  
**Core Functionality:** A complete user management and fund withdrawal system with separate user and admin dashboards  
**Target Users:** End users who want to manage funds and withdrawals; Admins who manage users and platform operations

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Routing:** React Router DOM v6

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite with better-sqlite3
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

---

## 3. Visual & UI Specification

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary | Deep Indigo | #4F46E5 |
| Primary Hover | Indigo 700 | #4338CA |
| Secondary | Slate | #64748B |
| Success | Emerald | #10B981 |
| Warning | Amber | #F59E0B |
| Danger | Rose | #F43F5E |
| Background | Slate 50 | #F8FAFC |
| Card Background | White | #FFFFFF |
| Text Primary | Slate 900 | #0F172A |
| Text Secondary | Slate 500 | #64748B |

### Typography
- **Headings:** Inter (Google Fonts)
- **Body:** Inter
- **Monospace:** JetBrains Mono (for numbers/balances)

### Layout
- Mobile-first responsive design
- Card-based UI components
- Consistent 16px/24px spacing rhythm
- Subtle shadows for depth (shadow-lg on cards)
- Rounded corners (rounded-xl)

---

## 4. Page Structure

### Public Pages (Unauthenticated)

#### Landing Page (`/`)
- Hero section with app name and tagline
- Features highlights (3 cards)
- Call-to-action buttons (Sign In / Create Account)
- Footer with links

#### Login Page (`/login`)
- Centered card layout
- Email input field
- Password input field
- "Remember me" checkbox
- "Forgot Password?" link
- Submit button with loading state
- Link to registration

#### Register Page (`/register`)
- Centered card layout
- Full name input
- Email input
- Password input (with strength indicator)
- Confirm password input
- Terms acceptance checkbox
- Submit button
- Link to login

#### Forgot Password Page (`/forgot-password`)
- Centered card layout
- Email input field
- Submit button
- Success/error message display
- Link back to login

#### Reset Password Page (`/reset-password/:token`)
- Centered card layout
- New password input
- Confirm password input
- Submit button
- Success/error message display

---

### User Dashboard (`/dashboard`)

#### Sidebar Navigation
- Logo/Brand at top
- Navigation items: Home, Withdraw, Support
- User profile section at bottom
- Logout button

#### Home Page (Dashboard Home)
- Welcome message with user name
- Balance card (prominent display)
  - Current balance with currency symbol
  - Account status badge (Active/Frozen)
  - Last updated timestamp
- Quick actions grid
- Recent activity list (last 5 transactions)

#### Withdraw Page (`/dashboard/withdraw`)
- Current balance display
- Withdrawal form
  - Amount input (with validation)
  - Payment method selector (Bank Transfer, Crypto)
  - Bank details / Wallet address field
  - Note field (optional)
- Transaction history table
- Minimum withdrawal notice

#### Support Page (`/dashboard/support`)
- Contact form
  - Subject input
  - Message textarea
  - Priority selector (Low/Medium/High)
- FAQ accordion section
- Previous tickets list

---

### Admin Panel (`/admin` - Hidden URL)

#### Login Page (`/admin/login`)
- Same style as user login
- Different branding/logo
- Admin credential inputs

#### Admin Dashboard (`/admin/dashboard`)
- Stats overview cards (Total Users, Total Balance, Pending Withdrawals, Frozen Accounts)
- Recent activity log
- Quick action buttons

#### User Management (`/admin/users`)
- Searchable user table
- Columns: Name, Email, Balance, Status, Joined Date, Actions
- Action buttons: View, Freeze/Unfreeze, Adjust Balance
- Bulk actions

#### User Detail Modal
- User information display
- Balance adjustment form (+/- amount with reason)
- Account status toggle
- Activity history

#### Withdrawal Requests (`/admin/withdrawals`)
- Pending requests table
- Approve/Reject buttons
- Request details modal

#### Support Tickets (`/admin/tickets`)
- Tickets list with status badges
- Reply functionality
- Mark as resolved

---

## 5. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password with token |
| GET | `/api/auth/me` | Get current user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/balance` | Get current balance |
| GET | `/api/user/transactions` | Get transaction history |

### Withdrawal
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/withdraw` | Create withdrawal request |
| GET | `/api/withdraw/history` | Get user's withdrawal history |

### Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support/ticket` | Create support ticket |
| GET | `/api/support/tickets` | Get user's tickets |

### Admin (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get platform statistics |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get single user |
| PUT | `/api/admin/users/:id/balance` | Adjust user balance |
| PUT | `/api/admin/users/:id/status` | Toggle user frozen status |
| GET | `/api/admin/withdrawals` | Get all withdrawals |
| PUT | `/api/admin/withdrawals/:id` | Approve/reject withdrawal |
| GET | `/api/admin/tickets` | Get all support tickets |
| PUT | `/api/admin/tickets/:id` | Update ticket status |

---

## 6. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  is_frozen BOOLEAN DEFAULT 0,
  is_admin BOOLEAN DEFAULT 0,
  reset_token TEXT,
  reset_token_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'adjustment'
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Withdrawals Table
```sql
CREATE TABLE withdrawals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Support Tickets Table
```sql
CREATE TABLE support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  admin_reply TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 7. Authentication & Security

### User Authentication
- JWT tokens stored in httpOnly cookies
- Token expiry: 24 hours
- Password requirements: minimum 8 characters
- Bcrypt hashing with salt rounds: 10

### Admin Authentication
- Separate admin login endpoint
- Admin role check middleware
- Restricted access to `/admin/*` routes

### Security Measures
- CORS configuration
- Helmet.js for security headers
- Rate limiting on auth endpoints
- Input sanitization
- CSRF protection

---

## 8. Component Library

### Buttons
- Primary (indigo fill)
- Secondary (outline)
- Danger (rose fill)
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading

### Inputs
- Text input with label
- Password input with toggle
- Select dropdown
- Textarea
- Checkbox

### Cards
- Stat card (with icon, value, label)
- Content card (with header, body)
- Action card

### Tables
- Responsive table wrapper
- Sortable headers
- Pagination
- Empty state

### Modals
- Centered overlay
- Close button
- Title and content
- Action buttons

### Notifications
- Toast notifications
- Types: success, error, warning, info
- Auto-dismiss after 5 seconds

### Navigation
- Sidebar (desktop)
- Bottom nav (mobile)
- Breadcrumbs

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Devices |
|------------|-------|---------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |

---

## 10. Acceptance Criteria

### User Features
- [ ] User can register with name, email, password
- [ ] User can login with email and password
- [ ] User can request password reset
- [ ] User can reset password with token
- [ ] User can view dashboard with balance
- [ ] User can withdraw funds
- [ ] User can view withdrawal history
- [ ] User can submit support tickets
- [ ] User can view support ticket history
- [ ] User can logout

### Admin Features
- [ ] Admin can login via separate `/admin/login` URL
- [ ] Admin can view all users
- [ ] Admin can search users by name/email
- [ ] Admin can view individual user details
- [ ] Admin can increase user balance
- [ ] Admin can decrease user balance
- [ ] Admin can freeze user account
- [ ] Admin can unfreeze user account
- [ ] Admin can approve withdrawal requests
- [ ] Admin can reject withdrawal requests
- [ ] Admin can view all support tickets
- [ ] Admin can respond to support tickets

### Security
- [ ] Non-admin cannot access admin routes
- [ ] Invalid tokens are rejected
- [ ] Frozen users cannot withdraw
- [ ] Passwords are hashed securely

### UI/UX
- [ ] All pages are responsive
- [ ] Loading states are displayed
- [ ] Error messages are user-friendly
- [ ] Success confirmations are shown
