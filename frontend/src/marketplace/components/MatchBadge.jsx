import React from 'react';
import { motion } from 'framer-motion';

const MatchBadge = ({ percentage, size = 'md' }) => {
  const getColor = (pct) => {
    if (pct >= 80) return { bg: '#00ADB5', text: '#222831', border: '#00ADB5' };
    if (pct >= 50) return { bg: 'rgba(0, 173, 181, 0.15)', text: '#00ADB5', border: 'rgba(0, 173, 181, 0.3)' };
    if (pct >= 25) return { bg: '#393E46', text: '#EEEEEE', border: 'rgba(238, 238, 238, 0.2)' };
    return { bg: '#222831', text: 'rgba(238, 238, 238, 0.5)', border: 'rgba(238, 238, 238, 0.1)' };
  };

  const colors = getColor(percentage);
  const isSmall = size === 'sm';

  return (
    <motion.div
      className="mp-match-badge"
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        fontSize: isSmall ? '0.7rem' : '0.78rem',
        padding: isSmall ? '2px 8px' : '4px 10px',
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      title={`Skill match: ${percentage}%`}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="5" cy="5" r="4" stroke={colors.text} strokeWidth="1.5" />
        <path d="M3 5L4.5 6.5L7 3.5" stroke={colors.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {percentage}% Match
    </motion.div>
  );
};

export default MatchBadge;
