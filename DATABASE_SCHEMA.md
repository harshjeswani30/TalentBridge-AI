# DATABASE SCHEMA — TalentBridge AI

> MongoDB collections used by the Job Marketplace feature (Task 2).

---

## 1. Users

Primary authentication collection. All users share this model; role-specific data lives in separate collections.

```js
{
  _id:       ObjectId,
  name:      String (required, max 100),
  email:     String (required, unique, lowercase),
  password:  String (required, hashed bcrypt, select: false),
  role:      String (enum: ['student', 'company'], required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `email` (unique)

---

## 2. Students

Student-specific profile data linked 1:1 with Users.

```js
{
  _id:       ObjectId,
  userId:    ObjectId → ref: User (unique),
  skills:    [String],        // e.g. ['javascript', 'react']
  level:     String (enum: ['beginner','intermediate','advanced','expert']),
  bio:       String (max 500),
  resume:    String,          // URL to resume file
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `userId` (unique)

---

## 3. Companies

Company-specific profile data linked 1:1 with Users.

```js
{
  _id:         ObjectId,
  userId:      ObjectId → ref: User (unique),
  companyName: String (required, max 150),
  description: String (max 1000),
  location:    String,
  logo:        String,   // URL
  website:     String,   // URL
  industry:    String,
  createdAt:   Date,
  updatedAt:   Date
}
```

**Indexes:** `userId` (unique)

---

## 4. Jobs

Job postings created by companies.

```js
{
  _id:             ObjectId,
  title:           String (required, max 150),
  description:     String (required, max 5000),
  company:         ObjectId → ref: Company (required),
  salary: {
    min:      Number,
    max:      Number,
    currency: String (default: 'USD')
  },
  location:        String (default: 'Remote'),
  jobType:         String (enum: ['full-time','part-time','contract','internship','remote']),
  experienceLevel: String (enum: ['entry','junior','mid','senior','lead']),
  requiredSkills:  [String],
  postedDate:      Date (default: now),
  isActive:        Boolean (default: true),
  createdAt:       Date,
  updatedAt:       Date
}
```

**Indexes:** `{ title, description, location }` (text), `company`, `jobType`, `location`, `{ isActive, postedDate: -1 }`

---

## 5. Applications

Student applications to job postings.

```js
{
  _id:         ObjectId,
  student:     ObjectId → ref: Student (required),
  job:         ObjectId → ref: Job (required),
  status:      String (enum: ['pending','reviewed','accepted','rejected'], default: 'pending'),
  coverLetter: String (max 2000),
  appliedDate: Date (default: now),
  createdAt:   Date,
  updatedAt:   Date
}
```

**Indexes:** `{ student, job }` (unique — prevents duplicate applications), `{ job, status }`, `{ student, appliedDate: -1 }`

---

## 6. Skills

Global skills library.

```js
{
  _id:      ObjectId,
  name:     String (required, unique, lowercase),
  category: String (enum: ['frontend','backend','database','devops','mobile','ai-ml','design','testing','other']),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `name` (unique)

---

## Entity Relationships

```
User (1) ──────── (1) Student
User (1) ──────── (1) Company
Company (1) ────── (N) Jobs
Student (1) ────── (N) Applications
Job (1) ──────────(N) Applications
```

---

## Skill Match Algorithm

```
matchedSkills = studentSkills ∩ requiredSkills
missingSkills = requiredSkills \ studentSkills
percentage    = round( |matchedSkills| / |requiredSkills| × 100 )
```

Returns: `{ percentage, matchedSkills, missingSkills }`
