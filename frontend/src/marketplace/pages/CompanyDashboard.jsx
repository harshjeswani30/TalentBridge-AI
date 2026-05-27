import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          axiosInstance.get('/jobs', { params: { limit: 100 } }),
          axiosInstance.get('/applications/company'),
        ]);
        // Filter to own jobs (populated with company info)
        setJobs(jobsRes.data.jobs);
        setApplications(appsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    totalJobs: jobs.length,
    totalApplicants: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
  };

  return (
    <div className="mp-page">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mp-dashboard-header"
      >
        <div>
          <h1 className="mp-page-title">Company Dashboard 🏢</h1>
          <p className="mp-page-sub">Manage your jobs and applications</p>
        </div>
        <Link to="/create-job" className="mp-btn-primary-sm">+ Post New Job</Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="mp-stats-grid">
        {[
          { label: 'Active Jobs', value: stats.totalJobs, color: '#00ADB5', bg: '#393E46' },
          { label: 'Total Applicants', value: stats.totalApplicants, color: '#EEEEEE', bg: '#393E46' },
          { label: 'Pending Review', value: stats.pending, color: 'rgba(238, 238, 238, 0.7)', bg: '#393E46' },
          { label: 'Accepted', value: stats.accepted, color: '#00ADB5', bg: '#393E46' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="mp-stat-widget"
            style={{ borderTop: `3px solid ${stat.color}` }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="mp-stat-widget-value" style={{ color: stat.color }}>{stat.value}</p>
            <p className="mp-stat-widget-label">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="mp-widget-card">
        <div className="mp-widget-header">
          <h3 className="mp-widget-title">Recent Applications</h3>
          <Link to="/manage-jobs" className="mp-link-sm">Manage Jobs →</Link>
        </div>
        {loading ? (
          <div className="mp-loading-inline"><div className="mp-spinner-sm" /></div>
        ) : applications.length === 0 ? (
          <div className="mp-empty-state-sm">
            <p>No applications yet. <Link to="/create-job" className="mp-auth-link">Post a job →</Link></p>
          </div>
        ) : (
          <div className="mp-table-wrap">
            <table className="mp-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => {
                  const studentUser = app.student?.userId || {};
                  return (
                    <tr key={app._id}>
                      <td>
                        <div className="mp-table-user">
                          <div className="mp-company-avatar mp-company-avatar-sm">
                            <span>{(studentUser.name || 'S').charAt(0)}</span>
                          </div>
                          <div>
                            <p className="mp-table-name">{studentUser.name || '—'}</p>
                            <p className="mp-app-company">{studentUser.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="mp-table-job">{app.job?.title || '—'}</span></td>
                      <td><span className="mp-app-date">{new Date(app.appliedDate).toLocaleDateString()}</span></td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <Link to={`/applicants/${app.job?._id}`} className="mp-btn-ghost-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
