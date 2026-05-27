const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentbridge_test';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
});

afterEach(async () => {
  await User.deleteMany({});
  await Student.deleteMany({});
  await Company.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Auth API — /api/auth', () => {
  // ── REGISTER ────────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new student and return JWT', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.email).toBe('student@test.com');
    });

    it('should register a new company and return JWT', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Acme Corp',
        email: 'hr@acme.com',
        password: 'password123',
        role: 'company',
        companyName: 'Acme Corp',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('company');
    });

    it('should return 422 when email is missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'No Email',
        password: 'password123',
        role: 'student',
      });
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 422 when password is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Short Pass',
        email: 'short@test.com',
        password: '123',
        role: 'student',
      });
      expect(res.status).toBe(422);
    });

    it('should return 409 when email is already registered', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'First User',
        email: 'duplicate@test.com',
        password: 'password123',
        role: 'student',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Second User',
        email: 'duplicate@test.com',
        password: 'password123',
        role: 'student',
      });
      expect(res.status).toBe(409);
    });
  });

  // ── LOGIN ───────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Login User',
        email: 'login@test.com',
        password: 'password123',
        role: 'student',
      });
    });

    it('should login with valid credentials and return JWT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('should return 401 with non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'ghost@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });

  // ── GET /me ─────────────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return current user data with valid JWT', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Me User',
        email: 'me@test.com',
        password: 'password123',
        role: 'student',
      });
      const token = reg.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('me@test.com');
      expect(res.body).toHaveProperty('profile');
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });
});
