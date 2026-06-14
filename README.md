# SalesCRM — Lead Management System

A full-stack CRM application for managing sales leads, tracking pipeline progress, and collaborating with your sales team.

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + Vite, Tailwind CSS        |
| Backend    | Node.js + Express                 |
| Database   | SQLite (via better-sqlite3)       |
| Auth       | JWT (JSON Web Tokens)             |
| HTTP Client| Axios                             |

## Features

- Authentication — JWT-based login with protected routes
- Lead Management — Full CRUD (create, view, edit, delete)
- Lead Status Tracking — New, Contacted, Qualified, Proposal Sent, Won, Lost
- Notes System — Add internal notes per lead with author tracking
- Dashboard — Live stats including total leads, won deals, pipeline value
- Search and Filtering — Filter by status, source, salesperson, search by name

## Running Locally

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone the repo
```bash
git clone https://github.com/mdulmini/crm-lead-management.git
cd crm-lead-management
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
Runs on http://localhost:5173
```

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Admin |
| sarah@example.com | password123 | Salesperson |
| mike@example.com  | password123 | Salesperson |

## Database

- SQLite file at backend/crm.db (auto-created on first run)
- Run npm run seed inside backend/ to reset with sample data
- Tables: users, leads, notes

## Environment Variables
PORT=5000

JWT_SECRET=your_secret_key_here

NODE_ENV=development

## Known Limitations

- SQLite is not suitable for multi-server production deployments
- No password reset or user registration UI
- No real-time updates

## Reflection

Building this CRM taught me how to wire a complete full-stack application with real authentication, relational data, and a polished UI. The biggest challenge was designing the JWT middleware and ensuring all protected routes correctly return 401 on token expiry. I chose SQLite to avoid complex database setup while keeping full relational SQL capabilities. The most rewarding part was seeing the dashboard populate with real data from the backend.
