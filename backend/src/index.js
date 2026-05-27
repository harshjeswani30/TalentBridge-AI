const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentbridge';

// Middleware
app.use(cors());
app.use(express.json());

// ─── Task 2: Job Marketplace Routes ──────────────────────────────────────────
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const studentRoutes = require('./routes/students');
const companyRoutes = require('./routes/companies');
const skillRoutes = require('./routes/skills');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/skills', skillRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TalentBridge API is healthy' });
});

// Root fallback
app.get('/', (req, res) => {
  res.status(200).send('TalentBridge AI — MERN Job Marketplace API is running.');
});

// 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// Connect to MongoDB & Start Server
console.log('Connecting to MongoDB...');
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully.');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = app;
