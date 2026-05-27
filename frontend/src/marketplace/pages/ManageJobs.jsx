import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axiosInstance.get('/jobs', { params: { limit: 100 } });
        setJobs(data.jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const toggleActive = async (job) => {
    try {
      const updated = await axiosInstance.put(`/jobs/${job._id}`, { isActive: !job.isActive });
      setJobs((prev) => prev.map((j) => j._id === job._id ? updated.data : j));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mp-page">
      <motion.div className="mp-dashboard-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="mp-page-title">Manage Jobs</h1>
          <p className="mp-page-sub">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link to="/create-job" className="mp-btn-primary-sm">+ Post New Job</Link>
      </motion.div>

      {loading ? (
        <div className="mp-loading-screen"><div className="mp-spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="mp-empty-state">
          <div className="mp-empty-icon">💼</div>
          <h3>No jobs posted yet</h3>
          <Link to="/create-job" className="mp-btn-submit" style={{ display: 'inline-block', width: 'auto', padding: '12px 24px' }}>Post Your First Job</Link>
        </div>
      ) : (
        <div className="mp-manage-jobs-list">
          <AnimatePresence>
            {jobs.map((job, i) => (
              <motion.div
                key={job._id}
                className="mp-manage-job-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="mp-manage-job-info">
                  <h3 className="mp-app-job-title">{job.title}</h3>
                  <div className="mp-job-meta">
                    <span className="mp-job-meta-item">📍 {job.location || 'Remote'}</span>
                    <span className="mp-job-meta-item">⚡ {job.jobType}</span>
                    <span className="mp-job-meta-item">🎯 {job.experienceLevel}</span>
                  </div>
                  <div className="mp-job-skills">
                    {job.requiredSkills?.slice(0, 4).map((s) => (
                      <span key={s} className="mp-skill-chip">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="mp-manage-job-actions">
                  <button
                    className={`mp-toggle-btn ${job.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleActive(job)}
                    title={job.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {job.isActive ? '● Active' : '○ Inactive'}
                  </button>
                  <Link to={`/applicants/${job._id}`} className="mp-btn-ghost-sm">Applicants</Link>
                  {confirmDelete === job._id ? (
                    <div className="mp-confirm-delete">
                      <span>Delete?</span>
                      <button className="mp-btn-danger-sm" onClick={() => handleDelete(job._id)} disabled={deletingId === job._id}>
                        {deletingId === job._id ? '...' : 'Yes'}
                      </button>
                      <button className="mp-btn-ghost-sm" onClick={() => setConfirmDelete(null)}>No</button>
                    </div>
                  ) : (
                    <button className="mp-btn-danger-sm" onClick={() => setConfirmDelete(job._id)}>Delete</button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
