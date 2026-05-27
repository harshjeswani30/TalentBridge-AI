import React from 'react';
import './marketplace.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobListing from './pages/JobListing';
import JobDetail from './pages/JobDetail';
import ApplyForm from './pages/ApplyForm';
import MyApplications from './pages/MyApplications';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Profile from './pages/Profile';
import CreateJob from './pages/CreateJob';
import ManageJobs from './pages/ManageJobs';
import Applicants from './pages/Applicants';
import SavedJobs from './pages/SavedJobs';

// Routes where footer should be hidden
const AUTH_ROUTES = ['/login', '/register'];

// Inner component so it can consume AuthContext for theme
const AppShell = () => {
  const { theme } = useAuth();
  const location = useLocation();
  const showFooter = location.pathname === '/';
  const hideFooter = AUTH_ROUTES.includes(location.pathname);

  const isJobsRoute = ['/jobs', '/saved-jobs', '/my-applications'].includes(location.pathname);

  return (
    <div className={`mp-root mp-${theme}${hideFooter ? ' mp-auth-shell' : ''}${isJobsRoute ? ' mp-jobs-shell' : ''}`}>
      <Navbar />
      <main className="mp-main">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<JobListing />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Student Only */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute role="student"><MyApplications /></ProtectedRoute>
          } />
          <Route path="/saved-jobs" element={
            <ProtectedRoute role="student"><SavedJobs /></ProtectedRoute>
          } />
          <Route path="/apply/:jobId" element={
            <ProtectedRoute role="student"><ApplyForm /></ProtectedRoute>
          } />

          {/* Company Only */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>
          } />
          <Route path="/create-job" element={
            <ProtectedRoute role="company"><CreateJob /></ProtectedRoute>
          } />
          <Route path="/manage-jobs" element={
            <ProtectedRoute role="company"><ManageJobs /></ProtectedRoute>
          } />
          <Route path="/applicants/:jobId" element={
            <ProtectedRoute role="company"><Applicants /></ProtectedRoute>
          } />

          {/* Any Auth */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

const MarketplaceApp = () => {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
};

export default MarketplaceApp;
