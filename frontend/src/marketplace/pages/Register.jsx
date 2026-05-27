import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') || 'student');
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', location: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'company' || r === 'student') setRole(r);
  }, [searchParams]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6) errs.password = 'Min. 6 characters';
    if (role === 'company' && !form.companyName.trim()) errs.companyName = 'Company name required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setIsDuplicate(false);
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      if (user.role === 'company') navigate('/dashboard');
      else navigate('/student-dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || '';
      if (status === 409 || msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exist')) {
        setIsDuplicate(true);
        setErrors((prev) => ({ ...prev, email: 'This email is already registered.' }));
      } else {
        setApiError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isRecruiter = role === 'company';

  return (
    <div className="mp-auth-split">
      {/* ── LEFT PANEL: Branding ── */}
      <div className="mp-auth-panel-left">
        <div className="mp-auth-brand-glow" />
        <div className="mp-auth-brand-content">
          <Link to="/" className="mp-auth-brand-logo">
            <div className="mp-auth-brand-icon">TB</div>
            <span className="mp-auth-brand-name">TalentBridge <span className="mp-auth-brand-ai">AI</span></span>
          </Link>
          <h2 className="mp-auth-brand-headline">
            {isRecruiter ? 'Find your next hire with AI' : 'Discover your dream role'}
          </h2>
          <p className="mp-auth-brand-sub">
            {isRecruiter
              ? 'Post jobs, screen applicants, and hire smarter with AI-powered tools.'
              : 'Join thousands of jobseekers getting placed at top companies.'}
          </p>
          <ul className="mp-auth-feature-list">
            {isRecruiter ? (
              <>
                <li><span className="mp-auth-feature-dot" />AI-scored applicant profiles</li>
                <li><span className="mp-auth-feature-dot" />One-click job posting</li>
                <li><span className="mp-auth-feature-dot" />Application pipeline management</li>
              </>
            ) : (
              <>
                <li><span className="mp-auth-feature-dot" />AI-powered job matching</li>
                <li><span className="mp-auth-feature-dot" />Real-time application tracking</li>
                <li><span className="mp-auth-feature-dot" />Direct recruiter connections</li>
              </>
            )}
          </ul>
          <div className="mp-auth-stats-row">
            <div className="mp-auth-stat"><span className="mp-auth-stat-num">12k+</span><span className="mp-auth-stat-lbl">Jobs listed</span></div>
            <div className="mp-auth-stat"><span className="mp-auth-stat-num">4k+</span><span className="mp-auth-stat-lbl">Companies</span></div>
            <div className="mp-auth-stat"><span className="mp-auth-stat-num">92%</span><span className="mp-auth-stat-lbl">Placement rate</span></div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="mp-auth-panel-right">
        <motion.div
          className="mp-auth-form-box"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mp-auth-form-header">
            <h1 className="mp-auth-form-title">Create account</h1>
            <p className="mp-auth-form-sub">Join TalentBridge AI today</p>
          </div>

          {/* Role Toggle */}
          <div className="mp-auth-role-toggle">
            <button
              type="button"
              className={`mp-auth-role-btn ${!isRecruiter ? 'active' : ''}`}
              onClick={() => { setRole('student'); setErrors({}); }}
            >
              💼 Jobseeker
            </button>
            <button
              type="button"
              className={`mp-auth-role-btn ${isRecruiter ? 'active' : ''}`}
              onClick={() => { setRole('company'); setErrors({}); }}
            >
              🏢 Recruiter
            </button>
          </div>

          {/* Duplicate email error */}
          <AnimatePresence>
            {isDuplicate && (
              <motion.div
                className="mp-alert mp-alert-duplicate"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span>⚠️ Account exists. </span>
                <Link to="/login" className="mp-alert-duplicate-link">Sign in instead →</Link>
              </motion.div>
            )}
          </AnimatePresence>

          {apiError && (
            <motion.div className="mp-alert mp-alert-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {apiError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mp-auth-fields" noValidate>
            {/* Row 1: Name + Email (always shown side by side) */}
            <div className="mp-auth-fields-row">
              <div className="mp-field">
                <label className="mp-field-label" htmlFor="reg-name">
                  {isRecruiter ? 'Contact Name' : 'Full Name'}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className={`mp-field-input ${errors.name ? 'mp-field-input-err' : ''}`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="mp-field-err-msg">{errors.name}</p>}
              </div>
              <div className="mp-field">
                <label className="mp-field-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  className={`mp-field-input ${errors.email ? 'mp-field-input-err' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="mp-field-err-msg">{errors.email}</p>}
              </div>
            </div>

            {/* Row 2: Password (+ Company Name for recruiter, side by side) */}
            <div className="mp-auth-fields-row">
              <div className="mp-field">
                <label className="mp-field-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className={`mp-field-input ${errors.password ? 'mp-field-input-err' : ''}`}
                  placeholder="Min. 6 chars"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className="mp-field-err-msg">{errors.password}</p>}
              </div>

              {isRecruiter && (
                <div className="mp-field">
                  <label className="mp-field-label" htmlFor="reg-company">Company Name</label>
                  <input
                    id="reg-company"
                    type="text"
                    className={`mp-field-input ${errors.companyName ? 'mp-field-input-err' : ''}`}
                    placeholder="Acme Corp"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                  {errors.companyName && <p className="mp-field-err-msg">{errors.companyName}</p>}
                </div>
              )}
            </div>

            {/* Row 3: Location (recruiter only, full width) */}
            {isRecruiter && (
              <div className="mp-field">
                <label className="mp-field-label" htmlFor="reg-location">Location <span className="mp-field-optional">(optional)</span></label>
                <input
                  id="reg-location"
                  type="text"
                  className="mp-field-input"
                  placeholder="San Francisco, CA"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            )}

            <motion.button
              type="submit"
              className="mp-auth-submit-btn"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="mp-btn-spinner" /> : `Create ${isRecruiter ? 'Recruiter' : 'Jobseeker'} Account →`}
            </motion.button>
          </form>

          <p className="mp-auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="mp-auth-switch-link">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
