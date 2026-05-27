/**
 * Seed script — populates TalentBridge with sample data
 * Run: node src/seeds/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Skill = require('../models/Skill');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentbridge';

const skills = [
  { name: 'javascript', category: 'frontend' },
  { name: 'typescript', category: 'frontend' },
  { name: 'react', category: 'frontend' },
  { name: 'vue', category: 'frontend' },
  { name: 'angular', category: 'frontend' },
  { name: 'html', category: 'frontend' },
  { name: 'css', category: 'frontend' },
  { name: 'tailwindcss', category: 'frontend' },
  { name: 'node.js', category: 'backend' },
  { name: 'express', category: 'backend' },
  { name: 'python', category: 'backend' },
  { name: 'django', category: 'backend' },
  { name: 'java', category: 'backend' },
  { name: 'go', category: 'backend' },
  { name: 'mongodb', category: 'database' },
  { name: 'postgresql', category: 'database' },
  { name: 'mysql', category: 'database' },
  { name: 'redis', category: 'database' },
  { name: 'docker', category: 'devops' },
  { name: 'kubernetes', category: 'devops' },
  { name: 'aws', category: 'devops' },
  { name: 'git', category: 'devops' },
  { name: 'react native', category: 'mobile' },
  { name: 'flutter', category: 'mobile' },
  { name: 'tensorflow', category: 'ai-ml' },
  { name: 'pytorch', category: 'ai-ml' },
  { name: 'figma', category: 'design' },
  { name: 'jest', category: 'testing' },
  { name: 'cypress', category: 'testing' },
];

const companySeedData = [
  {
    user: { name: 'TechNova Inc', email: 'hr@technova.com', password: 'password123', role: 'company' },
    profile: { companyName: 'TechNova Inc', description: 'Leading tech startup building the future of AI products.', location: 'San Francisco, CA', industry: 'Technology', website: 'https://technova.com' },
  },
  {
    user: { name: 'DevBridge', email: 'careers@devbridge.io', password: 'password123', role: 'company' },
    profile: { companyName: 'DevBridge', description: 'Software consultancy specializing in enterprise solutions.', location: 'New York, NY', industry: 'Consulting', website: 'https://devbridge.io' },
  },
  {
    user: { name: 'CloudScale', email: 'jobs@cloudscale.com', password: 'password123', role: 'company' },
    profile: { companyName: 'CloudScale', description: 'Cloud infrastructure and DevOps solutions provider.', location: 'Remote', industry: 'Cloud Services', website: 'https://cloudscale.com' },
  },
];

const studentSeedData = [
  {
    user: { name: 'Alice Johnson', email: 'alice@student.com', password: 'password123', role: 'student' },
    profile: { skills: ['javascript', 'react', 'node.js', 'mongodb', 'css', 'html'], level: 'intermediate', bio: 'Full-stack developer passionate about React and Node.js.' },
  },
  {
    user: { name: 'Bob Smith', email: 'bob@student.com', password: 'password123', role: 'student' },
    profile: { skills: ['python', 'django', 'postgresql', 'docker'], level: 'advanced', bio: 'Backend engineer with strong Python and cloud skills.' },
  },
  {
    user: { name: 'Carol Martinez', email: 'carol@student.com', password: 'password123', role: 'student' },
    profile: { skills: ['react', 'typescript', 'tailwindcss', 'figma'], level: 'beginner', bio: 'Frontend developer with a design eye.' },
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Skill.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // Seed skills
  const createdSkills = await Skill.insertMany(skills);
  console.log(`Created ${createdSkills.length} skills.`);

  // Seed companies
  const createdCompanies = [];
  for (const data of companySeedData) {
    const user = await User.create(data.user);
    const company = await Company.create({ userId: user._id, ...data.profile });
    createdCompanies.push({ user, company });
  }
  console.log(`Created ${createdCompanies.length} companies.`);

  // Seed students
  const createdStudents = [];
  for (const data of studentSeedData) {
    const user = await User.create(data.user);
    const student = await Student.create({ userId: user._id, ...data.profile });
    createdStudents.push({ user, student });
  }
  console.log(`Created ${createdStudents.length} students.`);

  // Seed jobs
  const jobData = [
    {
      title: 'Senior React Developer',
      description: 'We are looking for a skilled React developer to join our growing frontend team. You will be responsible for building and maintaining complex UI components.',
      company: createdCompanies[0].company._id,
      salary: { min: 80000, max: 120000 },
      location: 'San Francisco, CA',
      jobType: 'full-time',
      experienceLevel: 'senior',
      requiredSkills: ['react', 'javascript', 'typescript', 'css'],
    },
    {
      title: 'Full Stack Node.js Engineer',
      description: 'Join us as a full-stack engineer! Work with React on the frontend and Node.js/MongoDB on the backend to build scalable web applications.',
      company: createdCompanies[0].company._id,
      salary: { min: 70000, max: 100000 },
      location: 'Remote',
      jobType: 'remote',
      experienceLevel: 'mid',
      requiredSkills: ['node.js', 'react', 'mongodb', 'javascript'],
    },
    {
      title: 'Python Backend Developer',
      description: 'We need a Python expert to develop and maintain backend services, APIs, and data pipelines. Experience with Django and PostgreSQL is a must.',
      company: createdCompanies[1].company._id,
      salary: { min: 75000, max: 110000 },
      location: 'New York, NY',
      jobType: 'full-time',
      experienceLevel: 'mid',
      requiredSkills: ['python', 'django', 'postgresql', 'docker'],
    },
    {
      title: 'DevOps Engineer',
      description: 'Help us scale our infrastructure. Manage CI/CD pipelines, container orchestration, and cloud services on AWS.',
      company: createdCompanies[2].company._id,
      salary: { min: 90000, max: 130000 },
      location: 'Remote',
      jobType: 'remote',
      experienceLevel: 'senior',
      requiredSkills: ['docker', 'kubernetes', 'aws', 'git'],
    },
    {
      title: 'Frontend React Intern',
      description: 'Exciting internship opportunity for students to get hands-on experience with React, TailwindCSS and modern web development practices.',
      company: createdCompanies[1].company._id,
      salary: { min: 20000, max: 35000 },
      location: 'New York, NY',
      jobType: 'internship',
      experienceLevel: 'entry',
      requiredSkills: ['react', 'javascript', 'html', 'css'],
    },
  ];

  const createdJobs = await Job.insertMany(jobData);
  console.log(`Created ${createdJobs.length} jobs.`);

  // Seed applications
  const applicationData = [
    { student: createdStudents[0].student._id, job: createdJobs[0]._id, status: 'reviewed', coverLetter: 'I am very excited to apply for this position...' },
    { student: createdStudents[0].student._id, job: createdJobs[1]._id, status: 'pending', coverLetter: 'My full-stack experience makes me a great fit...' },
    { student: createdStudents[1].student._id, job: createdJobs[2]._id, status: 'accepted', coverLetter: 'Python and Django are my core strengths...' },
    { student: createdStudents[2].student._id, job: createdJobs[4]._id, status: 'pending', coverLetter: 'I am eager to learn and grow as a frontend developer...' },
  ];

  const createdApps = await Application.insertMany(applicationData);
  console.log(`Created ${createdApps.length} applications.`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest Accounts:');
  console.log('  Company:  hr@technova.com     / password123');
  console.log('  Company:  careers@devbridge.io / password123');
  console.log('  Student:  alice@student.com    / password123');
  console.log('  Student:  bob@student.com      / password123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
