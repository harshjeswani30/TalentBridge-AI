import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Bookmark, MapPin, Calendar, Trash2, ChevronRight } from 'lucide-react';
import MatchBadge from '../components/MatchBadge';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Load saved job IDs from localStorage
  const [savedIds, setSavedIds] = useState(() => {
    const saved = localStorage.getItem('jj_saved_job_ids');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchSavedJobs();
  }, [savedIds]);

  const fetchSavedJobs = async () => {
    if (savedIds.length === 0) {
      setSavedJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch all saved jobs in parallel using Express endpoint
      const jobsData = await Promise.all(
        savedIds.map(id => 
          axiosInstance.get(`/jobs/${id}`)
            .then(res => res.data)
            .catch(err => {
              console.error(`Failed to fetch job ${id}:`, err);
              return null;
            })
        )
      );

      // Filter out failed loads
      const validJobs = jobsData.filter(Boolean);
      setSavedJobs(validJobs);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Could not load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (e, jobId) => {
    e.stopPropagation();
    const updated = savedIds.filter(id => id !== jobId);
    setSavedIds(updated);
    localStorage.setItem('jj_saved_job_ids', JSON.stringify(updated));
  };

  const handleCardClick = (job) => {
    navigate(`/jobs/${job._id}`);
  };

  const logoInitial = (companyName) => (companyName || 'C').slice(0, 1).toUpperCase();

  return (
    <div className="mp-page animate-fade-in" style={{ height: '100%', overflowY: 'auto', paddingBottom: '16px' }}>

      {loading ? (
        <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="mp-spinner" style={{ width: '40px', height: '40px' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--mp-text-muted)', fontWeight: '500' }}>Loading bookmarked jobs...</span>
        </div>
      ) : error ? (
        <div className="mp-alert mp-alert-error" style={{ textAlign: 'center' }}>
          {error}
        </div>
      ) : savedJobs.length === 0 ? (
        <div style={{
          padding: '80px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--mp-bg-card)',
          borderRadius: 'var(--mp-radius-xl)',
          border: '1px solid var(--mp-border)',
          maxWidth: '580px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'var(--mp-primary-light)',
            color: 'var(--mp-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            <Bookmark size={28} style={{ fill: 'var(--mp-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--mp-text-primary)', marginBottom: '6px' }}>No Saved Jobs</h3>
            <p style={{ color: 'var(--mp-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '360px', margin: '0 auto' }}>
              You haven't bookmarked any jobs yet. When you find a job you like, click the bookmark icon to save it here!
            </p>
          </div>
          <Link to="/jobs" className="mp-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Explore Designer Jobs
            <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {savedJobs.map((job) => {
            const company = job.company || {};
            
            // Format posted date
            const postedDate = new Date(job.postedDate || job.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={job._id}
                onClick={() => handleCardClick(job)}
                style={{
                  backgroundColor: 'var(--mp-bg-card)',
                  borderRadius: 'var(--mp-radius-lg)',
                  border: '1px solid var(--mp-border)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: 'var(--mp-shadow-sm)',
                  transition: 'all var(--mp-transition)',
                  justifyContent: 'space-between'
                }}
                className="saved-job-grid-card"
              >
                <div>
                  {/* Top Row: Logo & Unsave button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div className="mp-company-avatar">
                      {company.logo ? (
                        <img src={company.logo} alt={company.companyName} />
                      ) : (
                        <span>{logoInitial(company.companyName)}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleUnsave(e, job._id)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: '1px solid var(--mp-border)', backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ef4444', cursor: 'pointer', transition: 'all var(--mp-transition)'
                      }}
                      title="Remove Bookmark"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Title & Company */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--mp-text-primary)', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                    {job.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--mp-text-secondary)', marginBottom: '12px' }}>
                    {company.companyName}
                  </div>

                  {/* Location, Salary and placement info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--mp-text-secondary)' }}>
                      <MapPin size={13} style={{ color: 'var(--mp-primary)' }} />
                      {job.location} {job.jobType ? `(${job.jobType})` : ''}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#00ADB5', fontWeight: '700' }}>
                      ₹{job.salary?.min?.toLocaleString()} - ₹{job.salary?.max?.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Card footer details */}
                <div style={{
                  borderTop: '1px solid var(--mp-border)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px'
                }}>
                  {job.skillMatch !== undefined ? (
                    <MatchBadge score={job.skillMatch} />
                  ) : (
                    <span style={{
                      padding: '3px 8px', borderRadius: '4px',
                      fontSize: '0.7rem', fontWeight: '700',
                      backgroundColor: 'var(--mp-primary-light)', color: 'var(--mp-primary)'
                    }}>
                      Active
                    </span>
                  )}

                  <span style={{ fontSize: '0.78rem', color: 'var(--mp-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={12} />
                    Posted {postedDate}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
