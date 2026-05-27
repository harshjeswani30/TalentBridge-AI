const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentbridge_test';

let companyToken, companyProfile, studentToken, studentProfile, testJob;

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);

  // Create company
  const compReg = await request(app).post('/api/auth/register').send({
    name: 'App Test Company',
    email: 'company@app-test.com',
    password: 'password123',
    role: 'company',
    companyName: 'AppTest Corp',
  });
  companyToken = compReg.body.token;
  companyProfile = await Company.findOne({ companyName: 'AppTest Corp' });

  // Create student
  const stuReg = await request(app).post('/api/auth/register').send({
    name: 'App Test Student',
    email: 'student@app-test.com',
    password: 'password123',
    role: 'student',
  });
  studentToken = stuReg.body.token;
  studentProfile = await Student.findOne({ userId: stuReg.body.user.id });

  // Create job
  testJob = await Job.create({
    title: 'Test Application Job',
    description: 'A job for application tests',
    company: companyProfile._id,
    requiredSkills: ['javascript', 'react'],
  });
});

afterEach(async () => {
  await Application.deleteMany({});
});

afterAll(async () => {
  await Job.deleteMany({});
  await User.deleteMany({});
  await Student.deleteMany({});
  await Company.deleteMany({});
  await mongoose.disconnect();
});

describe('Applications API — /api/applications', () => {
  // ── APPLY ────────────────────────────────────────────────────────────────────
  describe('POST /api/applications', () => {
    it('should create an application for a student', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ jobId: testJob._id.toString(), coverLetter: 'I am excited!' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.status).toBe('pending');
    });

    it('should return 409 on duplicate application', async () => {
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ jobId: testJob._id.toString() });

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ jobId: testJob._id.toString() });

      expect(res.status).toBe(409);
    });

    it('should return 403 when company tries to apply', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ jobId: testJob._id.toString() });

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ jobId: fakeId.toString() });

      expect(res.status).toBe(404);
    });
  });

  // ── LIST MY APPLICATIONS ─────────────────────────────────────────────────────
  describe('GET /api/applications', () => {
    it('should list applications for the current student', async () => {
      await Application.create({ student: studentProfile._id, job: testJob._id });

      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it('should return 403 for company trying to list student applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${companyToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ── COMPANY APPLICANTS ────────────────────────────────────────────────────────
  describe('GET /api/applications/company', () => {
    it('should list all applications for company jobs', async () => {
      await Application.create({ student: studentProfile._id, job: testJob._id });

      const res = await request(app)
        .get('/api/applications/company')
        .set('Authorization', `Bearer ${companyToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── UPDATE STATUS ─────────────────────────────────────────────────────────────
  describe('PUT /api/applications/:id', () => {
    it('should update application status to accepted', async () => {
      const app_ = await Application.create({ student: studentProfile._id, job: testJob._id });

      const res = await request(app)
        .put(`/api/applications/${app_._id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('accepted');
    });

    it('should return 422 for invalid status value', async () => {
      const app_ = await Application.create({ student: studentProfile._id, job: testJob._id });

      const res = await request(app)
        .put(`/api/applications/${app_._id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ status: 'invalid-status' });

      expect(res.status).toBe(422);
    });
  });
});
