# API DOCUMENTATION — TalentBridge AI

Base URL: `http://localhost:5000/api`

> All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## Authentication

### POST `/auth/register`
Register a new student or company account.

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123",
  "role": "student"
}
```
For company role, also include:
```json
{
  "companyName": "Acme Corp",
  "location": "San Francisco, CA"
}
```

**Response 201:**
```json
{
  "message": "Registration successful.",
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Alice Johnson", "email": "alice@example.com", "role": "student" }
}
```

**Errors:** `422` Validation, `409` Email taken

---

### POST `/auth/login`
Authenticate and receive a JWT.

**Request Body:**
```json
{ "email": "alice@example.com", "password": "password123" }
```

**Response 200:**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Alice Johnson", "email": "...", "role": "student" }
}
```

**Errors:** `422` Validation, `401` Invalid credentials

---

### GET `/auth/me` 🔒
Get current user info and role-specific profile.

**Response 200:**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "student" },
  "profile": { "skills": ["react","javascript"], "level": "intermediate", "bio": "..." }
}
```

---

## Jobs

### POST `/jobs` 🔒 (Company only)
Create a new job posting.

**Request Body:**
```json
{
  "title": "Senior React Developer",
  "description": "Build amazing React applications...",
  "location": "Remote",
  "jobType": "full-time",
  "experienceLevel": "senior",
  "requiredSkills": ["react", "javascript", "typescript"],
  "salary": { "min": 80000, "max": 120000 }
}
```

**Response 201:** Full job object with populated company.

**Errors:** `422` Validation, `403` Not a company

---

### GET `/jobs`
List all active jobs with search, filter, and pagination.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search title, description, skills |
| `location` | string | Filter by location (regex) |
| `jobType` | string | `full-time`, `part-time`, `contract`, `internship`, `remote` |
| `experienceLevel` | string | `entry`, `junior`, `mid`, `senior`, `lead` |
| `minSalary` | number | Filter by minimum salary |
| `maxSalary` | number | Filter by maximum salary |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |
| `sort` | string | `newest`, `oldest`, `salary_high`, `salary_low` |

**Response 200:**
```json
{
  "jobs": [
    {
      "_id": "...",
      "title": "Senior React Developer",
      "company": { "companyName": "TechNova", "location": "Remote", "logo": "" },
      "salary": { "min": 80000, "max": 120000 },
      "requiredSkills": ["react", "javascript"],
      "skillMatch": { "percentage": 75, "matchedSkills": ["react"], "missingSkills": ["javascript"] }
    }
  ],
  "pagination": { "total": 25, "page": 1, "limit": 10, "pages": 3 }
}
```

> `skillMatch` is only included when the request has a valid student JWT.

---

### GET `/jobs/:id`
Get full details of a single job.

**Response 200:** Full job object with company info. Includes `skillMatch` if authenticated student.

**Errors:** `404` Not found

---

### PUT `/jobs/:id` 🔒 (Company — owner only)
Update a job posting.

**Request Body:** Any job fields to update.

**Response 200:** Updated job object.

**Errors:** `403` Not owner, `404` Not found

---

### DELETE `/jobs/:id` 🔒 (Company — owner only)
Delete a job posting.

**Response 200:**
```json
{ "message": "Job deleted successfully." }
```

---

## Applications

### POST `/applications` 🔒 (Student only)
Apply to a job.

**Request Body:**
```json
{
  "jobId": "job_id_here",
  "coverLetter": "I am excited to apply because..."
}
```

**Response 201:** Application object with populated job and student.

**Errors:** `409` Already applied, `404` Job not found, `403` Not a student

---

### GET `/applications` 🔒 (Student only)
List current student's applications.

**Response 200:** Array of applications with populated job and company.

---

### GET `/applications/company` 🔒 (Company only)
List all applications for the company's jobs.

**Response 200:** Array of applications with populated student (user info + skills) and job.

---

### PUT `/applications/:id` 🔒 (Company only)
Update application status.

**Request Body:**
```json
{ "status": "accepted" }
```
Valid values: `pending`, `reviewed`, `accepted`, `rejected`

**Response 200:** Updated application object.

**Errors:** `422` Invalid status, `403` Not authorized

---

## Students

### GET `/students/profile` 🔒 (Student only)
Get current student's profile.

**Response 200:**
```json
{
  "_id": "...",
  "userId": { "name": "Alice", "email": "alice@example.com" },
  "skills": ["react", "javascript"],
  "level": "intermediate",
  "bio": "Full-stack developer..."
}
```

---

### PUT `/students/profile` 🔒 (Student only)
Update student profile.

**Request Body:**
```json
{
  "skills": ["react", "javascript", "typescript"],
  "level": "advanced",
  "bio": "Updated bio..."
}
```

**Response 200:** Updated student profile.

---

## Company

### GET `/company/profile` 🔒 (Company only)
Get current company's profile.

**Response 200:** Company object with userId populated.

---

### PUT `/company/profile` 🔒 (Company only)
Update company profile.

**Request Body:**
```json
{
  "companyName": "Acme Corp",
  "description": "We build amazing products...",
  "location": "San Francisco, CA",
  "website": "https://acme.com",
  "industry": "Technology"
}
```

---

## Skills

### GET `/skills`
List all skills. Optional filters: `?category=frontend&search=react`

**Response 200:** Array of skill objects `{ _id, name, category }`.

---

### POST `/skills` 🔒
Add a new skill.

**Request Body:**
```json
{ "name": "svelte", "category": "frontend" }
```

**Response 201:** Created skill object.

**Errors:** `409` Skill already exists

---

## Error Format

All errors return:
```json
{
  "message": "Human-readable error description"
}
```

Validation errors (422):
```json
{
  "errors": [
    { "field": "email", "msg": "Valid email is required" }
  ]
}
```
