const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentbridge_test';

let companyToken, companyProfile, studentToken;

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);

  // Create company
  const companyReg = await request(app).post('/api/auth/register').send({
    name: 'Test Company',
    email: 'company@jobs-test.com',
    password: 'password123',
    role: 'company',
    companyName: 'Test Corp',
  });
  companyToken = companyReg.body.token;
  companyProfile = await Company.findOne({ companyName: 'Test Corp' });

  // Create student
  const studentReg = await request(app).post('/api/auth/register').send({
    name: 'Test Student',
    email: 'student@jobs-test.com',
    password: 'password123',
    role: 'student',
  });
  studentToken = studentReg.body.token;
});

afterEach(async () => {
  await Job.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await Student.deleteMany({});
  await Company.deleteMany({});
  await mongoose.disconnect();
});

describe('Jobs API — /api/jobs', () => {
  // ── CREATE JOB ──────────────────────────────────────────────────────────────
  describe('POST /api/jobs', () => {
    it('should create a job when authenticated as company', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'React Developer',
          description: 'Build amazing React apps',
          location: 'Remote',
          jobType: 'full-time',
          experienceLevel: 'mid',
          requiredSkills: ['react', 'javascript'],
          salary: { min: 60000, max: 90000 },
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('React Developer');
      expect(res.body.requiredSkills).toContain('react');
    });

    it('should return 403 when student tries to create job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Hacked Job', description: 'desc' });

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).post('/api/jobs').send({ title: 'No auth' });
      expect(res.status).toBe(401);
    });

    it('should return 422 when title is missing', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ description: 'No title job' });
      expect(res.status).toBe(422);
    });
  });

  // ── LIST JOBS ───────────────────────────────────────────────────────────────
  describe('GET /api/jobs', () => {
    beforeEach(async () => {
      await Job.create([
        {
          title: 'React Dev',
          description: 'React role',
          company: companyProfile._id,
          location: 'New York',
          jobType: 'full-time',
          requiredSkills: ['react', 'javascript'],
          salary: { min: 50000, max: 80000 },
        },
        {
          title: 'Python Engineer',
          description: 'Python role',
          company: companyProfile._id,
          location: 'Remote',
          jobType: 'remote',
          requiredSkills: ['python', 'django'],
          salary: { min: 70000, max: 100000 },
        },
      ]);
    });

    it('should list all active jobs', async () => {
      const res = await request(app).get('/api/jobs');
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter jobs by search query', async () => {
      const res = await request(app).get('/api/jobs?search=Python');
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBe(1);
      expect(res.body.jobs[0].title).toBe('Python Engineer');
    });

    it('should filter by jobType', async () => {
      const res = await request(app).get('/api/jobs?jobType=remote');
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBe(1);
    });

    it('should filter by location', async () => {
      const res = await request(app).get('/api/jobs?location=New York');
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBe(1);
    });

    it('should paginate results', async () => {
      const res = await request(app).get('/api/jobs?page=1&limit=1');
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBe(1);
      expect(res.body.pagination.pages).toBe(2);
    });
  });

  // ── GET JOB BY ID ────────────────────────────────────────────────────────────
  describe('GET /api/jobs/:id', () => {
    it('should return a single job by ID', async () => {
      const job = await Job.create({
        title: 'Single Job',
        description: 'Get by ID test',
        company: companyProfile._id,
      });

      const res = await request(app).get(`/api/jobs/${job._id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Single Job');
    });

    it('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/jobs/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  // ── UPDATE JOB ────────────────────────────────────────────────────────────────
  describe('PUT /api/jobs/:id', () => {
    it('should update job owned by company', async () => {
      const job = await Job.create({
        title: 'Old Title',
        description: 'desc',
        company: companyProfile._id,
      });

      const res = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });
  });

  // ── DELETE JOB ────────────────────────────────────────────────────────────────
  describe('DELETE /api/jobs/:id', () => {
    it('should delete job owned by company', async () => {
      const job = await Job.create({
        title: 'To Delete',
        description: 'desc',
        company: companyProfile._id,
      });

      const res = await request(app)
        .delete(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${companyToken}`);

      expect(res.status).toBe(200);

      const deleted = await Job.findById(job._id);
      expect(deleted).toBeNull();
    });
  });
});
