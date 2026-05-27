import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'company') navigate('/dashboard');
      else if (user.role === 'student') navigate('/student-dashboard');
      else navigate(from);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="mp-auth-brand-headline">Your next opportunity starts here</h2>
          <p className="mp-auth-brand-sub">Connect with top companies and land your dream role with AI-powered matching.</p>
          <ul className="mp-auth-feature-list">
            <li><span className="mp-auth-feature-dot" />AI-powered job matching</li>
            <li><span className="mp-auth-feature-dot" />Real-time application tracking</li>
            <li><span className="mp-auth-feature-dot" />Direct recruiter connections</li>
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
            <h1 className="mp-auth-form-title">Welcome back</h1>
            <p className="mp-auth-form-sub">Sign in to your account</p>
          </div>

          {apiError && (
            <motion.div
              className="mp-alert mp-alert-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {apiError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mp-auth-fields" noValidate>
            <div className="mp-field">
              <label className="mp-field-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className={`mp-field-input ${errors.email ? 'mp-field-input-err' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="mp-field-err-msg">{errors.email}</p>}
            </div>

            <div className="mp-field">
              <label className="mp-field-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className={`mp-field-input ${errors.password ? 'mp-field-input-err' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              {errors.password && <p className="mp-field-err-msg">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              className="mp-auth-submit-btn"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="mp-btn-spinner" /> : 'Sign In →'}
            </motion.button>
          </form>

          <p className="mp-auth-switch-text">
            Don't have an account?{' '}
            <Link to="/register" className="mp-auth-switch-link">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
