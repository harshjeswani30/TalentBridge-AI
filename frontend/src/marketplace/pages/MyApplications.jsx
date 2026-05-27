import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, RefreshCw, MapPin, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data } = await axiosInstance.get('/applications');
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Could not fetch applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mp-page animate-fade-in" style={{ height: '100%', overflowY: 'auto', paddingBottom: '16px' }}>

      {loading ? (
        <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="mp-spinner" style={{ width: '40px', height: '40px' }} />
          <span style={{ fontSize: '14.5px', color: 'var(--mp-text-muted)', fontWeight: '500' }}>Loading applications...</span>
        </div>
      ) : error ? (
        <div className="mp-alert mp-alert-error" style={{ textAlign: 'center' }}>
          {error}
        </div>
      ) : applications.length === 0 ? (
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
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--mp-primary-light)', color: 'var(--mp-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🚀</div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--mp-text-primary)', marginBottom: '6px' }}>No Applications Yet</h3>
            <p style={{ color: 'var(--mp-text-muted)', fontSize: '14.5px', lineHeight: '1.5', maxWidth: '360px', margin: '0 auto' }}>
              You haven't applied to any job postings. Browse our live listings and make your first application today!
            </p>
          </div>
          <Link to="/jobs" className="mp-btn-primary" style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Find Jobs Now
            <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map((app) => {
            const job = app.job || {};
            const company = job.company || {};
            const logoInitial = (company.companyName || 'C').slice(0, 1).toUpperCase();
            
            // Format applied date
            const appliedDate = new Date(app.appliedDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={app._id}
                style={{
                  backgroundColor: 'var(--mp-bg-card)',
                  borderRadius: 'var(--mp-radius-lg)',
                  border: '1px solid var(--mp-border)',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  boxShadow: 'var(--mp-shadow-sm)',
                  transition: 'all var(--mp-transition)'
                }}
                className="application-row-card"
              >
                {/* Left side: Job details */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: '280px' }}>
                  <div className="mp-company-avatar mp-company-avatar-sm">
                    {company.logo ? (
                      <img src={company.logo} alt={company.companyName} />
                    ) : (
                      <span>{logoInitial}</span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--mp-text-primary)', margin: '0 0 4px 0' }}>
                      {job.title || 'Unknown Job'}
                    </h3>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--mp-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{company.companyName || '—'}</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--mp-border)' }} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={11} style={{ color: 'var(--mp-primary)' }} />
                        {job.location || 'Remote'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Salary & applied date */}
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }} className="application-meta-group">
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--mp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Offered Salary
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#00ADB5' }}>
                      ₹{job.salary?.min?.toLocaleString()} - ₹{job.salary?.max?.toLocaleString()}/mo
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--mp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Applied On
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--mp-text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} style={{ color: 'var(--mp-text-muted)' }} />
                      {appliedDate}
                    </div>
                  </div>
                </div>

                {/* Right side: status + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
                  <StatusBadge status={app.status} />
                  
                  <Link
                    to={`/jobs/${job._id}`}
                    className="mp-btn-ghost-sm"
                    style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0
                    }}
                    title="View Job Posting"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
