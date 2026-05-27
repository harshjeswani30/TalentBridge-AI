import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { to: '/jobs', label: 'Browse Jobs' },
    { to: '/my-applications', label: 'My Applications' },
    { to: '/saved-jobs', label: 'Saved Jobs' },
  ];

  const companyLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/manage-jobs', label: 'Manage Jobs' },
    { to: '/create-job', label: 'Post Job' },
  ];

  // Guest links shown to unauthenticated users.
  // My Applications & Saved Jobs are shown but intercept the click to redirect to sign-up.
  const guestLinks = [
    { to: '/jobs', label: 'Browse Jobs', guestAllowed: true },
    { to: '/my-applications', label: 'My Applications', guestAllowed: false },
    { to: '/saved-jobs', label: 'Saved Jobs', guestAllowed: false },
  ];

  const links = user?.role === 'company'
    ? companyLinks
    : user?.role === 'student'
      ? studentLinks
      : guestLinks;

  const roleLabel = user?.role === 'company'
    ? 'Recruiter'
    : user?.role === 'student'
      ? 'Jobseeker'
      : '';

  return (
    <nav className="mp-navbar">
      <div className="mp-navbar-inner">

        {/* ── LEFT: Logo + Brand ──────────────────────────────── */}
        <div className="mp-nav-left">
          <Link to="/" className="mp-nav-logo">
            <div className="mp-logo-icon">TB</div>
            <span className="mp-logo-text">
              TalentBridge <span className="mp-logo-ai">AI</span>
            </span>
          </Link>
        </div>

        {/* ── MIDDLE: Navigation tabs ─────────────────────────── */}
        <div className="mp-nav-center">
          {links.map((l) => {
            // Guest-restricted links intercept click and send to register
            if (!user && l.guestAllowed === false) {
              return (
                <button
                  key={l.to}
                  className={`mp-nav-link mp-nav-link-btn ${isActive(l.to) ? 'active' : ''}`}
                  onClick={() => navigate('/register')}
                >
                  {l.label}
                </button>
              );
            }
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`mp-nav-link ${isActive(l.to) ? 'active' : ''}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* ── RIGHT: Theme toggle + User profile ──────────────── */}
        <div className="mp-nav-right">
          {/* Theme Toggle */}
          <button
            className="mp-theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label="Toggle theme"
          >
            <span className={`mp-theme-icon ${theme === 'light' ? 'visible' : ''}`}>
              <MoonIcon />
            </span>
            <span className={`mp-theme-icon ${theme === 'dark' ? 'visible' : ''}`}>
              <SunIcon />
            </span>
          </button>

          {user ? (
            /* ── Logged-in user panel ── */
            <div className="mp-user-section" ref={dropdownRef}>
              <div className="mp-user-info">
                <span className="mp-user-name">{user.name}</span>
                <span className="mp-user-role">{roleLabel}</span>
              </div>
              <div
                className={`mp-user-avatar ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setDropdownOpen(!dropdownOpen)}
                aria-label="Open user menu"
              >
                <span>{user.name.charAt(0).toUpperCase()}</span>
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="mp-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="mp-dropdown-header">
                      <p className="mp-dropdown-name">{user.name}</p>
                      <p className="mp-dropdown-role">{roleLabel}</p>
                    </div>
                    <div className="mp-dropdown-divider" />
                     {user.role === 'student' ? (
                      <>
                        <Link to="/student-dashboard" className="mp-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          🎨 Portfolio
                        </Link>
                        <Link to="/saved-jobs" className="mp-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          🔖 Saved Jobs
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/profile" className="mp-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          👤 My Profile
                        </Link>
                        {user.role === 'company' && (
                          <Link to="/dashboard" className="mp-dropdown-item" onClick={() => setDropdownOpen(false)}>
                            📊 Dashboard
                          </Link>
                        )}
                      </>
                    )}
                    <div className="mp-dropdown-divider" />
                    <button className="mp-dropdown-item mp-dropdown-logout" onClick={handleLogout}>
                      🚪 Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Guest buttons ── */
            <div className="mp-nav-guest-actions">
              <Link to="/login" className="mp-btn-ghost">Log In</Link>
              <Link to="/register" className="mp-btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
