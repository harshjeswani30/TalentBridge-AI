import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const ApplyForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axiosInstance.get(`/jobs/${jobId}`);
        setJob(data);
      } catch {
        setError('Failed to load job details.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/applications', { jobId, coverLetter });
      setSuccess(true);
      setTimeout(() => navigate('/my-applications'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="mp-loading-screen">
        <div className="mp-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mp-page mp-empty-state">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="mp-success-icon">🎉</div>
          <h2 className="mp-success-title">Application Submitted!</h2>
          <p className="mp-section-sub">Redirecting to your applications...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mp-page">
      <div className="mp-auth-card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link to={`/jobs/${jobId}`} className="mp-back-link">← Back to Job</Link>

        {job && (
          <div className="mp-apply-job-info">
            <h2 className="mp-apply-form-title">Apply for:</h2>
            <h3 className="mp-detail-job-title">{job.title}</h3>
            <p className="mp-detail-company-name">{job.company?.companyName} · {job.location}</p>
          </div>
        )}

        {error && (
          <motion.div
            className="mp-alert mp-alert-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mp-auth-form">
          <div className="mp-form-group">
            <label className="mp-form-label" htmlFor="cover-letter">
              Cover Letter <span className="mp-form-optional">(optional)</span>
            </label>
            <textarea
              id="cover-letter"
              className="mp-input mp-textarea"
              placeholder="Tell the company why you're a great fit. Mention relevant experience, skills, and why you're excited about this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={8}
              maxLength={2000}
            />
            <p className="mp-char-count">{coverLetter.length} / 2000</p>
          </div>

          <motion.button
            type="submit"
            className="mp-btn-submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <span className="mp-btn-spinner" /> : '🚀 Submit Application'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ApplyForm;
