import React from 'react';

const SkeletonCard = () => (
  <div className="mp-skeleton-card">
    <div className="mp-skeleton-header">
      <div className="mp-skeleton mp-skeleton-avatar" />
      <div className="mp-skeleton-lines">
        <div className="mp-skeleton mp-skeleton-line" style={{ width: '60%' }} />
        <div className="mp-skeleton mp-skeleton-line" style={{ width: '40%' }} />
      </div>
    </div>
    <div className="mp-skeleton mp-skeleton-line" style={{ width: '90%', marginBottom: 8 }} />
    <div className="mp-skeleton mp-skeleton-line" style={{ width: '70%', marginBottom: 8 }} />
    <div className="mp-skeleton-tags">
      <div className="mp-skeleton mp-skeleton-tag" />
      <div className="mp-skeleton mp-skeleton-tag" />
      <div className="mp-skeleton mp-skeleton-tag" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 6 }) => (
  <div className="mp-job-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
