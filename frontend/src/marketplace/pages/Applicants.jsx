import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';

const STATUS_OPTIONS = ['pending', 'reviewed', 'accepted', 'rejected'];

const Applicants = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, jobRes] = await Promise.all([
          axiosInstance.get('/applications/company'),
          axiosInstance.get(`/jobs/${jobId}`),
        ]);
        const filtered = appsRes.data.filter((a) => a.job?._id === jobId || a.job?._id?.toString() === jobId);
        setApplications(filtered);
        setJobTitle(jobRes.data.title);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      const { data } = await axiosInstance.put(`/applications/${appId}`, { status });
      setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status: data.status } : a));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="mp-page">
      <motion.div className="mp-page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <Link to="/manage-jobs" className="mp-back-link">← Manage Jobs</Link>
          <h1 className="mp-page-title">Applicants</h1>
          {jobTitle && <p className="mp-page-sub">For: {jobTitle} · {applications.length} application{applications.length !== 1 ? 's' : ''}</p>}
        </div>
      </motion.div>

      {loading ? (
        <div className="mp-loading-screen"><div className="mp-spinner" /></div>
      ) : applications.length === 0 ? (
        <div className="mp-empty-state">
          <div className="mp-empty-icon">📋</div>
          <h3>No applicants yet</h3>
          <p>Share this job listing to attract candidates.</p>
        </div>
      ) : (
        <div className="mp-applicants-list">
          {applications.map((app, i) => {
            const studentUser = app.student?.userId || {};
            const studentProfile = app.student || {};
            return (
              <motion.div
                key={app._id}
                className="mp-applicant-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="mp-applicant-info">
                  <div className="mp-profile-avatar mp-profile-avatar-sm">
                    {(studentUser.name || 'S').charAt(0)}
                  </div>
                  <div>
                    <h3 className="mp-app-job-title">{studentUser.name || 'Unknown'}</h3>
                    <p className="mp-app-company">{studentUser.email}</p>
                    <p className="mp-app-date">Level: {studentProfile.level}</p>
                    <div className="mp-job-skills" style={{ marginTop: 6 }}>
                      {studentProfile.skills?.slice(0, 5).map((s) => (
                        <span key={s} className="mp-skill-chip">{s}</span>
                      ))}
                    </div>
                    {app.coverLetter && (
                      <details className="mp-cover-letter-details">
                        <summary className="mp-link-sm">View Cover Letter</summary>
                        <p className="mp-detail-text" style={{ marginTop: 8 }}>{app.coverLetter}</p>
                      </details>
                    )}
                  </div>
                </div>
                <div className="mp-applicant-actions">
                  <StatusBadge status={app.status} />
                  <p className="mp-app-date">{new Date(app.appliedDate).toLocaleDateString()}</p>
                  <select
                    className="mp-input mp-status-select"
                    value={app.status}
                    disabled={updating === app._id}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applicants;
