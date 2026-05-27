import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import MatchBadge from '../components/MatchBadge';
import { useAuth } from '../context/AuthContext';

const JOB_TYPE_COLORS = {
  'full-time': { bg: '#00ADB5', text: '#222831' },
  'part-time': { bg: 'rgba(0, 173, 181, 0.15)', text: '#00ADB5' },
  'contract': { bg: '#393E46', text: '#EEEEEE' },
  'internship': { bg: 'rgba(238, 238, 238, 0.1)', text: '#EEEEEE' },
  'remote': { bg: '#393E46', text: '#00ADB5' },
};

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axiosInstance.get(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="mp-loading-screen">
        <div className="mp-spinner" />
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mp-page mp-empty-state">
        <div className="mp-empty-icon">💼</div>
        <h3>Job not found</h3>
        <Link to="/jobs" className="mp-btn-outline">Back to Jobs</Link>
      </div>
    );
  }

  const company = job.company || {};
  const typeColor = JOB_TYPE_COLORS[job.jobType] || { bg: '#f3f4f6', text: '#374151' };
  const salaryText =
    job.salary?.min && job.salary?.max
      ? `$${job.salary.min.toLocaleString()} – $${job.salary.max.toLocaleString()}`
      : 'Not specified';

  return (
    <div className="mp-page mp-detail-layout">
      {/* Main Content */}
      <motion.div
        className="mp-detail-main"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mp-detail-header">
          <Link to="/jobs" className="mp-back-link">← Back to Jobs</Link>
          <div className="mp-detail-title-row">
            <div className="mp-detail-company-avatar">
              {company.logo ? (
                <img src={company.logo} alt={company.companyName} />
              ) : (
                <span>{(company.companyName || 'C').charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="mp-detail-job-title">{job.title}</h1>
              <p className="mp-detail-company-name">{company.companyName}</p>
            </div>
          </div>

          <div className="mp-detail-meta">
            <span className="mp-job-meta-item">📍 {job.location || 'Remote'}</span>
            <span className="mp-job-meta-item">💰 {salaryText}</span>
            <span className="mp-job-meta-item">⏱ {job.experienceLevel} level</span>
            <span
              className="mp-job-type-badge"
              style={{ background: typeColor.bg, color: typeColor.text }}
            >
              {job.jobType}
            </span>
            {job.skillMatch && (
              <MatchBadge percentage={job.skillMatch.percentage} />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mp-detail-section">
          <h2 className="mp-detail-section-title">Job Description</h2>
          <p className="mp-detail-text">{job.description}</p>
        </div>

        {/* Required Skills */}
        {job.requiredSkills?.length > 0 && (
          <div className="mp-detail-section">
            <h2 className="mp-detail-section-title">Required Skills</h2>
            <div className="mp-skill-list">
              {job.requiredSkills.map((skill) => {
                const isMatched = job.skillMatch?.matchedSkills?.includes(skill);
                const isMissing = job.skillMatch?.missingSkills?.includes(skill);
                return (
                  <span
                    key={skill}
                    className={`mp-skill-chip-lg ${isMatched ? 'matched' : isMissing ? 'missing' : ''}`}
                  >
                    {isMatched && '✓ '}{isMissing && '✗ '}{skill}
                  </span>
                );
              })}
            </div>
            {job.skillMatch && (
              <p className="mp-match-hint">
                ✓ = you have it &nbsp;·&nbsp; ✗ = you're missing it
              </p>
            )}
          </div>
        )}

        {/* Company Info */}
        {company.description && (
          <div className="mp-detail-section">
            <h2 className="mp-detail-section-title">About {company.companyName}</h2>
            <p className="mp-detail-text">{company.description}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="mp-auth-link">
                Visit Website →
              </a>
            )}
          </div>
        )}
      </motion.div>

      {/* Sticky Apply Sidebar */}
      <motion.aside
        className="mp-detail-sidebar"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mp-apply-card">
          <h3 className="mp-apply-title">Apply for this Job</h3>
          {job.skillMatch && (
            <div className="mp-apply-match">
              <div className="mp-apply-match-bar-wrap">
                <div
                  className="mp-apply-match-bar"
                  style={{ width: `${job.skillMatch.percentage}%` }}
                />
              </div>
              <p className="mp-apply-match-text">{job.skillMatch.percentage}% skill match</p>
            </div>
          )}
          <div className="mp-apply-info">
            <p><strong>Posted:</strong> {new Date(job.postedDate).toLocaleDateString()}</p>
            <p><strong>Type:</strong> {job.jobType}</p>
            <p><strong>Experience:</strong> {job.experienceLevel}</p>
            <p><strong>Location:</strong> {job.location || 'Remote'}</p>
          </div>
          {user?.role === 'student' ? (
            applied ? (
              <div className="mp-alert mp-alert-success">Application submitted! 🎉</div>
            ) : (
              <button
                className="mp-btn-submit"
                onClick={() => navigate(`/apply/${job._id}`)}
              >
                Apply Now →
              </button>
            )
          ) : !user ? (
            <>
              <button
                className="mp-btn-submit"
                style={{ width: '100%' }}
                onClick={() => navigate('/register?role=student')}
              >
                Sign Up to Apply →
              </button>
              <p className="mp-apply-company-note" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/login" className="mp-auth-link">Sign in</Link>
              </p>
            </>
          ) : (
            <p className="mp-apply-company-note">Companies cannot apply to jobs.</p>
          )}
        </div>
      </motion.aside>
    </div>
  );
};

export default JobDetail;
