import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, RefreshCw,
  Share2, Bookmark, CheckCircle2, AlertTriangle, Briefcase, Check, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import MatchBadge from '../components/MatchBadge';
import FilterPanel from '../components/FilterPanel';

let cachedJobs = null;
let cachedApplications = null;

const DEFAULT_FILTERS = { jobType: '', experienceLevel: '', minSalary: 0, sort: 'newest' };

const JobListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Job data states
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Bookmarks & Applications tracking states
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(() => {
    const saved = localStorage.getItem('jj_saved_job_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // Action states
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState({ type: '', text: '' });
  const [shareSuccess, setShareSuccess] = useState(false);

  // Load URL queries on page load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query');
    const loc = params.get('location');
    const r = params.get('role');
    const jt = params.get('jobType');
    const sal = params.get('minSalary');

    if (q) setSearchQuery(q);
    if (loc) setLocationFilter(loc);
    if (r) setRoleFilter(r);
    if (jt || sal) {
      setFilters(prev => ({
        ...prev,
        ...(jt && { jobType: jt }),
        ...(sal && { minSalary: Number(sal) })
      }));
    }
  }, [location.search]);

  // Fetch jobs and user applications
  useEffect(() => {
    fetchJobs();
    fetchUserApplications();
  }, [user]);

  // Real-time updates: Poll for new jobs in the background every 5 seconds silently
  useEffect(() => {
    const interval = setInterval(() => {
      fetchJobs(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async (forceQuiet = false) => {
    try {
      if (cachedJobs && !forceQuiet) {
        setJobs(cachedJobs);
        setLoading(false);
      } else if (!forceQuiet) {
        setLoading(true);
      }
      setError('');
      
      const { data } = await axiosInstance.get('/jobs', {
        params: { limit: 100 }
      });
      
      const mappedJobs = (data.jobs || []);
      cachedJobs = mappedJobs;
      setJobs(mappedJobs);

      // Select first job by default on desktop if none selected
      setSelectedJob(prev => {
        if (prev && mappedJobs.some(j => j._id === prev._id)) {
          return mappedJobs.find(j => j._id === prev._id);
        }
        return mappedJobs.length > 0 ? mappedJobs[0] : null;
      });
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (!cachedJobs) {
        setError('Could not connect to database.');
      }
    } finally {
      if (!forceQuiet) {
        setLoading(false);
      }
    }
  };

  const fetchUserApplications = async () => {
    if (!user || user.role !== 'student') return;
    if (cachedApplications) {
      setAppliedJobIds(cachedApplications);
    }
    try {
      const { data } = await axiosInstance.get('/applications');
      if (data) {
        const appIds = data.map(app => app.job?._id || app.job);
        cachedApplications = appIds;
        setAppliedJobIds(appIds);
      }
    } catch (err) {
      console.error('Error fetching user applications:', err);
    }
  };

  // Toggle Save Job
  const toggleSaveJob = (jobId) => {
    let updated;
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter(id => id !== jobId);
    } else {
      updated = [...savedJobIds, jobId];
    }
    setSavedJobIds(updated);
    localStorage.setItem('jj_saved_job_ids', JSON.stringify(updated));
  };

  // Apply to job post
  const handleApply = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      setApplyMessage({ type: 'error', text: 'Only Jobseekers can apply for jobs!' });
      setTimeout(() => setApplyMessage({ type: '', text: '' }), 4000);
      return;
    }

    try {
      setApplyLoading(true);
      setApplyMessage({ type: '', text: '' });

      await axiosInstance.post('/applications', {
        jobId,
        coverLetter: 'Applied via TalentBridge Premium Portal'
      });

      setAppliedJobIds([...appliedJobIds, jobId]);
      setApplyMessage({ type: 'success', text: 'Applied successfully! Your profile has been sent to the recruiter.' });
      setTimeout(() => setApplyMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Error applying for job:', err);
      setApplyMessage({ type: 'error', text: err.response?.data?.message || 'Server error occurred while applying.' });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleShare = (job) => {
    const url = `${window.location.origin}/jobs?role=${encodeURIComponent(job.role || 'All')}&query=${encodeURIComponent(job.company?.companyName || '')}`;
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setLocationFilter('');
    setRoleFilter('All');
  };

  // MERN Filter logic matching just_job + side FilterPanel
  const filteredJobs = jobs.filter(job => {
    const company = job.company || {};
    
    const matchesRole = roleFilter === 'All' || 
      (job.role && job.role.toLowerCase() === roleFilter.toLowerCase()) ||
      (job.title && job.title.toLowerCase().includes(roleFilter.toLowerCase()));
    
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.companyName && company.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
      
    const matchesLocation = !locationFilter || 
      (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
    const matchesJobType = !filters.jobType || 
      (job.jobType && job.jobType.toLowerCase() === filters.jobType.toLowerCase());

    const matchesExperience = !filters.experienceLevel ||
      (job.experienceLevel && job.experienceLevel.toLowerCase() === filters.experienceLevel.toLowerCase());
    
    const salaryVal = job.salary?.min || 0;
    const matchesSalary = salaryVal >= Number(filters.minSalary || 0);
      
    return matchesRole && matchesSearch && matchesLocation && matchesJobType && matchesExperience && matchesSalary;
  });

  // Client-side sorting based on FilterPanel choice
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (filters.sort === 'newest') {
      return new Date(b.postedDate || b.createdAt) - new Date(a.postedDate || a.createdAt);
    }
    if (filters.sort === 'oldest') {
      return new Date(a.postedDate || a.createdAt) - new Date(b.postedDate || b.createdAt);
    }
    if (filters.sort === 'salary_high') {
      return (b.salary?.max || 0) - (a.salary?.max || 0);
    }
    if (filters.sort === 'salary_low') {
      return (a.salary?.min || 0) - (b.salary?.min || 0);
    }
    return 0;
  });

  const getDeadlineDate = (createdAtString) => {
    const date = new Date(createdAtString);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  };
  return (
    <div className="mp-page animate-fade-in" style={{ height: '100%', overflow: 'hidden' }}>
      
      {/* Layout: Side FilterPanel + Jobs main split content */}
      <div className="mp-listing-layout" style={{ height: '100%', overflow: 'hidden' }}>
        
        {/* Left Side: Filter Panel */}
        <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleReset} />

        {/* Right Side: Main Openings Pane */}
        <div className="mp-listing-main" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'hidden' }}>


          {/* Split Pane: Left jobs list + Right details card */}
          {loading ? (
            <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div className="mp-spinner" style={{ width: '48px', height: '48px' }} />
              <span style={{ fontSize: '14.5px', color: 'var(--mp-text-muted)', fontWeight: '500' }}>Loading openings...</span>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div style={{ padding: '80px 24px', textAlign: 'center', backgroundColor: 'var(--mp-bg-card)', borderRadius: '24px', border: '1.5px solid var(--mp-border)', maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--mp-primary-light)', color: 'var(--mp-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🔍</div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--mp-text-primary)', marginBottom: '6px' }}>No Roles Found</h3>
                <p style={{ color: 'var(--mp-text-muted)', fontSize: '13.5px', lineHeight: '1.5', maxWidth: '360px', margin: '0 auto' }}>
                  We couldn't find any listings matching your search parameters. Try clearing filters.
                </p>
              </div>
              <button onClick={handleReset} className="mp-btn-outline" style={{ fontWeight: '600', padding: '10px 20px', fontSize: '13px' }}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px', flex: 1, minHeight: 0, overflow: 'hidden' }} className="jobs-layout-grid">
              
              {/* Left Column Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
                
                {/* Search Bar in its horizontal style above the list */}
                <div style={{
                  background: 'var(--mp-bg-card)',
                  borderRadius: '20px',
                  border: '1.5px solid var(--mp-border)',
                  padding: '10px 16px',
                  boxShadow: 'var(--mp-shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexShrink: 0
                }}>
                  {/* Keyword Search */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--mp-border)', borderRadius: '12px', padding: '6px 10px', flex: 1.2, backgroundColor: 'var(--mp-bg-input)' }}>
                    <Search size={14} style={{ color: 'var(--mp-text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Search roles or skills..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12.5px', color: 'var(--mp-text-primary)', fontWeight: '500' }}
                    />
                    {searchQuery && <X size={12} style={{ cursor: 'pointer', color: 'var(--mp-text-muted)' }} onClick={() => setSearchQuery('')} />}
                  </div>

                  {/* Location Search */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--mp-border)', borderRadius: '12px', padding: '6px 10px', flex: 1, backgroundColor: 'var(--mp-bg-input)' }}>
                    <MapPin size={14} style={{ color: 'var(--mp-primary)' }} />
                    <input 
                      type="text" 
                      placeholder="Location..." 
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12.5px', color: 'var(--mp-text-primary)', fontWeight: '500' }}
                    />
                    {locationFilter && <X size={12} style={{ cursor: 'pointer', color: 'var(--mp-text-muted)' }} onClick={() => setLocationFilter('')} />}
                  </div>
                </div>

                {/* Left Column: Job Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', flex: 1, minHeight: 0, overflow: 'hidden', borderRadius: '20px', border: '1.5px solid var(--mp-border)', backgroundColor: 'var(--mp-bg-card)', boxShadow: 'var(--mp-shadow-sm)' }} className="jobs-list-pane">

                {/* List Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--mp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--mp-bg-card)', borderTopLeftRadius: '18px', borderTopRightRadius: '18px', flexShrink: 0 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--mp-text-primary)', margin: 0 }}>
                    Open Roles <span style={{ color: 'var(--mp-text-muted)', fontWeight: '600', marginLeft: '2px' }}>({sortedJobs.length})</span>
                  </h3>
                  <button 
                    onClick={handleReset} 
                    style={{ background: 'none', border: 'none', color: 'var(--mp-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                </div>

                {/* Scrollable list content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {sortedJobs.map((job, idx) => {
                    const isSelected = selectedJob && selectedJob._id === job._id;
                    const isLast = idx === sortedJobs.length - 1;
                    const isApplied = appliedJobIds.includes(job._id);
                    const company = job.company || {};
                    const logoInitial = (company.companyName || 'C').slice(0, 1).toUpperCase();

                    return (
                      <div
                        key={job._id}
                        onClick={() => setSelectedJob(job)}
                        style={{
                          display: 'flex',
                          gap: '14px',
                          padding: '18px 20px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--mp-bg-card-hover)' : 'transparent',
                          borderLeft: isSelected ? '4px solid var(--mp-primary)' : '4px solid transparent',
                          borderBottom: isLast ? 'none' : '1px solid var(--mp-border)',
                          transition: 'all var(--mp-transition)',
                          position: 'relative',
                          alignItems: 'flex-start'
                        }}
                        className="linkedin-job-card"
                      >
                        {/* Avatar */}
                        <div className="mp-company-avatar mp-company-avatar-sm">
                          {company.logo ? (
                            <img src={company.logo} alt={company.companyName} />
                          ) : (
                            <span>{logoInitial}</span>
                          )}
                        </div>

                        {/* Job Card Body */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '2px' }}>
                            <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--mp-text-primary)', lineHeight: '1.3', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.title}
                            </h4>
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--mp-text-secondary)', marginBottom: '8px' }}>
                            {company.companyName}
                          </div>

                          {/* Location and Salary pills */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--mp-text-secondary)', backgroundColor: 'var(--mp-bg-input)', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>
                              <MapPin size={10} style={{ color: 'var(--mp-primary)' }} />
                              {job.location}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#00ADB5', backgroundColor: 'var(--mp-primary-light)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                              ₹{job.salary?.min?.toLocaleString()} - ₹{job.salary?.max?.toLocaleString()}/mo
                            </span>
                          </div>
                        </div>

                        {/* Applying Badge */}
                        {isApplied && (
                          <div style={{
                            position: 'absolute', top: '16px', right: '16px',
                            padding: '2px 8px', borderRadius: '999px',
                            fontSize: '9px', fontWeight: '800',
                            backgroundColor: 'var(--mp-primary-light)', color: 'var(--mp-primary)',
                            border: '1px solid var(--mp-border)'
                          }}>
                            ● APPLIED
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Job Detail Pane */}
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '20px', border: '1.5px solid var(--mp-border)', backgroundColor: 'var(--mp-bg-card)', boxShadow: 'var(--mp-shadow-sm)', overflow: 'hidden' }} className="job-details-pane">
                {selectedJob ? (
                  <>
                    {/* Header */}
                    <div style={{
                      padding: '28px',
                      borderBottom: '1px solid var(--mp-border)',
                      background: 'var(--mp-bg-card)',
                      flexShrink: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      {/* Company Avatar and Titles */}
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="mp-company-avatar">
                          {selectedJob.company?.logo ? (
                            <img src={selectedJob.company.logo} alt={selectedJob.company.companyName} />
                          ) : (
                            <span>{(selectedJob.company?.companyName || 'C').slice(0, 1).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--mp-text-primary)', margin: '0 0 4px 0', lineHeight: '1.2', letterSpacing: '-0.3px' }}>
                            {selectedJob.title}
                          </h2>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--mp-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{selectedJob.company?.companyName}</span>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--mp-border)' }} />
                            <span style={{ color: 'var(--mp-text-muted)', fontWeight: '500' }}>Recruitment Open</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleShare(selectedJob)}
                          style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            border: '1px solid var(--mp-border)', backgroundColor: 'var(--mp-bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: shareSuccess ? '#00ADB5' : 'var(--mp-text-secondary)', cursor: 'pointer',
                            transition: 'all var(--mp-transition)'
                          }}
                          title="Copy Job Link"
                        >
                          {shareSuccess ? <Check size={16} /> : <Share2 size={16} />}
                        </button>

                        <button
                          onClick={() => toggleSaveJob(selectedJob._id)}
                          style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            border: '1px solid var(--mp-border)', 
                            backgroundColor: savedJobIds.includes(selectedJob._id) ? 'var(--mp-primary-light)' : 'var(--mp-bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: savedJobIds.includes(selectedJob._id) ? 'var(--mp-primary)' : 'var(--mp-text-secondary)', 
                            cursor: 'pointer', transition: 'all var(--mp-transition)'
                          }}
                          title={savedJobIds.includes(selectedJob._id) ? 'Saved' : 'Save Job'}
                        >
                          <Bookmark size={16} style={{ fill: savedJobIds.includes(selectedJob._id) ? 'var(--mp-primary)' : 'none' }} />
                        </button>

                        <button
                          onClick={() => handleApply(selectedJob._id)}
                          disabled={applyLoading || appliedJobIds.includes(selectedJob._id)}
                          className="mp-btn-primary"
                          style={{
                            padding: '10px 24px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '700',
                            backgroundColor: appliedJobIds.includes(selectedJob._id) ? 'var(--mp-border)' : 'var(--mp-primary)',
                            color: appliedJobIds.includes(selectedJob._id) ? 'var(--mp-text-muted)' : 'white',
                            border: 'none', cursor: (applyLoading || appliedJobIds.includes(selectedJob._id)) ? 'not-allowed' : 'pointer',
                            minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          {appliedJobIds.includes(selectedJob._id) ? (
                            <>Applied ✓</>
                          ) : applyLoading ? (
                            <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <>Apply Now →</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Apply Messages banner */}
                    {applyMessage.text && (
                      <div className={`mp-alert ${applyMessage.type === 'success' ? 'mp-alert-success' : 'mp-alert-error'}`} style={{
                        margin: '10px 28px 0 28px',
                        padding: '10px 16px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {applyMessage.type === 'success' ? <CheckCircle2 size={14} style={{ color: 'var(--mp-primary)' }} /> : <AlertTriangle size={14} />}
                        {applyMessage.text}
                      </div>
                    )}

                    {/* Metadata cards row */}
                    <div style={{
                      padding: '20px 28px 16px 28px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px',
                      borderBottom: '1px solid var(--mp-border)',
                      flexShrink: 0
                    }}>
                      {[
                        { label: 'Salary', value: `₹${selectedJob.salary?.min?.toLocaleString()} - ₹${selectedJob.salary?.max?.toLocaleString()}/mo` },
                        { label: 'Location', value: selectedJob.location },
                        { label: 'Openings', value: `1 Active` },
                        { label: 'Deadline', value: getDeadlineDate(selectedJob.createdAt) }
                      ].map((card, i) => (
                        <div key={i} style={{
                          backgroundColor: 'var(--mp-bg-card-hover)',
                          border: '1.5px solid var(--mp-border)',
                          borderRadius: '14px',
                          padding: '12px 14px',
                          textAlign: 'left'
                        }}>
                          <div style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--mp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            {card.label}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--mp-text-primary)' }}>
                            {card.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Body split content */}
                    <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '28px' }}>
                      {/* Left sub-column: Description details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* About the Role */}
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--mp-text-primary)', marginBottom: '12px' }}>
                            About the Role
                          </h3>
                          <div style={{ fontSize: '13.5px', color: 'var(--mp-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {selectedJob.description}
                          </div>
                        </div>

                        {/* Role Requirements */}
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--mp-text-primary)', marginBottom: '12px' }}>
                            Requirements & Responsibilities
                          </h3>
                          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                              "Work closely with our product design team to create wireframes, prototypes, and user flows.",
                              "Ensure design quality is high-converting and matches premium company standards.",
                              "Deliver high-fidelity assets formatted cleanly for development handoff.",
                              "Iterate based on product manager feedback and user testing data."
                            ].map((resp, i) => (
                              <li key={i} style={{ fontSize: '13.5px', color: 'var(--mp-text-secondary)', lineHeight: '1.5' }}>
                                {resp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right sub-column: Sidebar widgets */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Required Skills */}
                        <div style={{
                          padding: '18px',
                          borderRadius: '16px',
                          border: '1.5px solid var(--mp-border)',
                          backgroundColor: 'var(--mp-bg-card-hover)'
                        }}>
                          <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--mp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                            Required Skills
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 ? (
                              selectedJob.requiredSkills.map((skill, i) => (
                                <span key={i} style={{
                                  padding: '5px 12px', borderRadius: '8px',
                                  fontSize: '11.5px', fontWeight: '700',
                                  backgroundColor: 'var(--mp-bg-card)', color: 'var(--mp-text-primary)',
                                  border: '1px solid var(--mp-border)'
                                }}>
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--mp-text-light)' }}>No skills specified</span>
                            )}
                          </div>
                        </div>

                        {/* About Company */}
                        <div style={{
                          padding: '18px',
                          borderRadius: '16px',
                          border: '1.5px solid var(--mp-border)',
                          backgroundColor: 'var(--mp-bg-card-hover)'
                        }}>
                          <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--mp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                            About Recruiter
                          </h4>
                          <p style={{ fontSize: '12.5px', color: 'var(--mp-text-secondary)', lineHeight: '1.5', margin: 0 }}>
                            {selectedJob.company?.description || 'A highly esteemed and vetted employer recruiting top talent through verified developer placements.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', padding: '24px', color: 'var(--mp-text-muted)' }}>
                    <Briefcase size={40} strokeWidth={1.5} />
                    <span>Select a role on the left to view details</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListing;
