import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mp-footer">
      <div className="mp-footer-inner">
        {/* Brand */}
        <div className="mp-footer-brand">
          <Link to="/" className="mp-footer-brand-logo">
            <div className="mp-logo-icon">TB</div>
            <span>TalentBridge <span className="mp-logo-ai">AI</span></span>
          </Link>
          <p className="mp-footer-desc">
            An intelligent MERN stack job marketplace helping students connect with companies through automated skill matching.
          </p>
        </div>

        {/* Links: Platform */}
        <div>
          <h4 className="mp-footer-heading">Platform</h4>
          <ul className="mp-footer-links">
            <li><Link to="/jobs" className="mp-footer-link">Browse Jobs</Link></li>
            <li><Link to="/login" className="mp-footer-link">Sign In</Link></li>
            <li><Link to="/register" className="mp-footer-link">Create Account</Link></li>
          </ul>
        </div>

        {/* Links: Resources */}
        <div>
          <h4 className="mp-footer-heading">Tech Stack</h4>
          <ul className="mp-footer-links">
            <li className="mp-footer-link">MongoDB / Mongoose</li>
            <li className="mp-footer-link">Express.js API</li>
            <li className="mp-footer-link">React.js / Vite</li>
            <li className="mp-footer-link">Node.js Server</li>
          </ul>
        </div>

        {/* Links: Info */}
        <div>
          <h4 className="mp-footer-heading">Contact</h4>
          <ul className="mp-footer-links">
            <li className="mp-footer-link">📧 support@talentbridge.ai</li>
            <li className="mp-footer-link">🏢 Silicon Valley, CA</li>
            <li className="mp-footer-link">🌐 github.com/talentbridge</li>
          </ul>
        </div>
      </div>

      <div className="mp-footer-divider" />

      <div className="mp-footer-bottom">
        <p>© {new Date().getFullYear()} TalentBridge AI. All rights reserved.</p>
        <p>Built with ❤️ using React 19 & Tailwind CSS</p>
      </div>
    </footer>
  );
};

export default Footer;
