import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { value: '500+', label: 'Jobs Posted' },
  { value: '2,000+', label: 'Jobseekers' },
  { value: '150+', label: 'Companies' },
  { value: '85%', label: 'Hire Rate' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'AI Skill Matching',
    desc: 'Our algorithm computes your skill match percentage for every job so you apply where it counts.',
  },
  {
    icon: '🏢',
    title: 'Top Companies',
    desc: 'Connect with industry-leading startups and enterprises actively hiring top talent.',
  },
  {
    icon: '⚡',
    title: 'Instant Applications',
    desc: 'Apply with one click. Track every application status in real-time on your dashboard.',
  },
  {
    icon: '🔒',
    title: 'Secure & Trusted',
    desc: 'JWT-secured accounts with verified company profiles ensure a safe hiring process.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="mp-home">
      {/* ── Hero ── */}
      <section className="mp-hero">
        <div className="mp-hero-glow mp-hero-glow-1" />
        <div className="mp-hero-glow mp-hero-glow-2" />
        <motion.div
          className="mp-hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mp-hero-kicker">
            🚀 AI-Powered Job Marketplace
          </motion.div>
          <motion.h1 variants={itemVariants} className="mp-hero-title">
            Find Your Perfect <br />
            <span className="mp-gradient-text">Career Match</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mp-hero-subtitle">
            TalentBridge AI connects jobseekers with dream opportunities using intelligent
            skill-matching. See exactly how well you fit every role before you apply.
          </motion.p>
          <motion.div variants={itemVariants} className="mp-hero-cta">
            {user ? (
              user.role === 'student' ? (
                <Link to="/jobs" className="mp-btn-hero-primary">Browse Jobs →</Link>
              ) : (
                <Link to="/create-job" className="mp-btn-hero-primary">Post a Job →</Link>
              )
            ) : (
              <>
                <Link to="/register" className="mp-btn-hero-primary">Get Started Free →</Link>
                <Link to="/jobs" className="mp-btn-hero-ghost">Browse Jobs</Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          className="mp-hero-visual"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="mp-hero-card mp-hero-card-1">
            <div className="mp-hero-card-icon">💼</div>
            <div>
              <p className="mp-hero-card-title">Senior React Dev</p>
              <p className="mp-hero-card-sub">TechNova · Remote</p>
            </div>
            <div className="mp-hero-match-pill">92% Match</div>
          </div>
          <div className="mp-hero-card mp-hero-card-2">
            <div className="mp-hero-card-icon">🐍</div>
            <div>
              <p className="mp-hero-card-title">Python Engineer</p>
              <p className="mp-hero-card-sub">DevBridge · NYC</p>
            </div>
            <div className="mp-hero-match-pill mp-match-mid">78% Match</div>
          </div>
          <div className="mp-hero-card mp-hero-card-3">
            <div className="mp-hero-card-icon">☁️</div>
            <div>
              <p className="mp-hero-card-title">DevOps Engineer</p>
              <p className="mp-hero-card-sub">CloudScale · Remote</p>
            </div>
            <div className="mp-hero-match-pill mp-match-low">55% Match</div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="mp-stats-section">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="mp-stat-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <p className="mp-stat-value">{s.value}</p>
            <p className="mp-stat-label">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="mp-features-section">
        <motion.div
          className="mp-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mp-section-title">Why TalentBridge AI?</h2>
          <p className="mp-section-sub">Everything you need to land your next role faster.</p>
        </motion.div>
        <div className="mp-features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="mp-feature-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="mp-feature-icon">{f.icon}</div>
              <h3 className="mp-feature-title">{f.title}</h3>
              <p className="mp-feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mp-cta-section">
        <motion.div
          className="mp-cta-card"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="mp-cta-title">Ready to launch your career?</h2>
          <p className="mp-cta-sub">Join thousands of jobseekers who found their dream job through TalentBridge AI.</p>
          <div className="mp-cta-actions">
            <Link to="/register?role=student" className="mp-btn-hero-primary">I'm a Jobseeker</Link>
            <Link to="/register?role=company" className="mp-btn-cta-ghost">I'm Hiring</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
