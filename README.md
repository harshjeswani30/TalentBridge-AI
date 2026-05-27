# TalentBridge AI — Standalone Job Marketplace

A complete, production-ready MERN stack Job Marketplace application connecting companies with student candidates using AI skill matching.

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, Vite, React Router, Framer Motion, Axios |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Testing | Jest, Supertest (backend) · Jest, React Testing Library (frontend) |

---

## Features

- **JWT Authentication** — Register and login for students and companies, with role-guarded routes
- **Skill Matching** — Calculates `matchedSkills / requiredSkills × 100%` for every job based on the student's profile skills
- **Job Listings** — Search and filter by location/salary/job type/experience, with sorting and pagination
- **Applications** — Apply with a cover letter, track status, and view company review workflows
- **Dashboards** — Student application tracking + company job/applicant management panel
- **Profile Editor** — Interactive skill chip builder for students, profile details editor for companies
- **13 Unified Pages/Views** — Home, Login, Register, Job Listing, Job Detail, Apply, My Applications, Student Dashboard, Company Dashboard, Profile, Create Job, Manage Jobs, Applicants

---

## Project Structure

```text
Task2/
├── backend/
│   ├── src/
│   │   ├── models/          # User, Student, Company, Job, Application, Skill
│   │   ├── routes/          # auth, jobs, applications, students, companies, skills
│   │   ├── middleware/      # auth.js (JWT), roleGuard.js
│   │   ├── utils/           # skillMatcher.js
│   │   ├── seeds/           # seedData.js
│   │   └── tests/           # auth, jobs, applications integration tests
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── marketplace/     # Core components, pages, context, and styles
│   │   │   ├── api/         # axiosInstance.js
│   │   │   ├── context/     # AuthContext.jsx
│   │   │   ├── components/  # Navbar, JobCard, MatchBadge, FilterPanel, etc.
│   │   │   ├── pages/       # 13 views
│   │   │   ├── tests/       # Login, JobListing, ApplyWorkflow test suites
│   │   │   └── marketplace.css
│   │   ├── index.css
│   │   └── main.jsx         # App entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── jest.config.cjs
│   └── babel.config.cjs
├── DATABASE_SCHEMA.md
├── API_DOCUMENTATION.md
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- MongoDB running locally on port 27017

### 1. Backend Setup

```bash
cd backend
pnpm install
```

Create `backend/.env` (or copy `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talentbridge
JWT_SECRET=talentbridge_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# Seed the database with sample data
pnpm run seed

# Start development server
pnpm run dev
```

### 2. Frontend Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

The application runs at: `http://localhost:5173/`

---

## Seed Accounts

After running `pnpm run seed` in the backend, these test accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Company | hr@technova.com | password123 |
| Company | careers@devbridge.io | password123 |
| Student | alice@student.com | password123 |
| Student | bob@student.com | password123 |

---

## Running Tests

### Backend Tests (Jest + Supertest)

```bash
cd backend
pnpm test
```

### Frontend Tests (Jest + React Testing Library)

```bash
cd frontend
pnpm test
```

---

## Documentation

- **API Documentation**: See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)
- **Database Schema**: See [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)
