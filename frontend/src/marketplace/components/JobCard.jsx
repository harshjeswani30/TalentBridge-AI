import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MatchBadge from './MatchBadge';

const JOB_TYPE_COLORS = {
  'full-time': { bg: '#00ADB5', text: '#222831' },
  'part-time': { bg: 'rgba(0, 173, 181, 0.15)', text: '#00ADB5' },
  'contract': { bg: '#393E46', text: '#EEEEEE' },
  'internship': { bg: 'rgba(238, 238, 238, 0.1)', text: '#EEEEEE' },
  'remote': { bg: '#393E46', text: '#00ADB5' },
};

const JobCard = ({ job, index = 0 }) => {
  const typeColor = JOB_TYPE_COLORS[job.jobType] || { bg: '#f3f4f6', text: '#374151' };
  const company = job.company || {};
  const salaryText =
    job.salary?.min && job.salary?.max
      ? `$${(job.salary.min / 1000).toFixed(0)}k – $${(job.salary.max / 1000).toFixed(0)}k`
      : job.salary?.min
      ? `From $${(job.salary.min / 1000).toFixed(0)}k`
      : 'Salary not specified';

  const postedAgo = job.postedDate
    ? Math.floor((Date.now() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      className="mp-job-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Card Header */}
      <div className="mp-job-card-header">
        <div className="mp-company-avatar">
          {company.logo ? (
            <img src={company.logo} alt={company.companyName} />
          ) : (
            <span>{(company.companyName || 'C').charAt(0)}</span>
          )}
        </div>
        <div className="mp-job-card-title-wrap">
          <h3 className="mp-job-title">{job.title}</h3>
          <p className="mp-job-company">{company.companyName || 'Unknown Company'}</p>
        </div>
        {job.skillMatch && (
          <MatchBadge percentage={job.skillMatch.percentage} size="sm" />
        )}
      </div>

      {/* Meta */}
      <div className="mp-job-meta">
        <span className="mp-job-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {job.location || 'Remote'}
        </span>
        <span className="mp-job-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          {salaryText}
        </span>
        {postedAgo !== null && (
          <span className="mp-job-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {postedAgo === 0 ? 'Today' : `${postedAgo}d ago`}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.requiredSkills?.length > 0 && (
        <div className="mp-job-skills">
          {job.requiredSkills.slice(0, 4).map((skill) => (
            <span key={skill} className="mp-skill-chip">{skill}</span>
          ))}
          {job.requiredSkills.length > 4 && (
            <span className="mp-skill-chip mp-skill-more">+{job.requiredSkills.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mp-job-card-footer">
        <span
          className="mp-job-type-badge"
          style={{ background: typeColor.bg, color: typeColor.text }}
        >
          {job.jobType}
        </span>
        <Link to={`/jobs/${job._id}`} className="mp-btn-card-view">
          View Job →
        </Link>
      </div>
    </motion.div>
  );
};

export default JobCard;
