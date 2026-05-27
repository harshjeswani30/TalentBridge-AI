import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead'];

const FilterPanel = ({ filters, onChange, onReset }) => {
  const [localMinSalary, setLocalMinSalary] = useState(filters.minSalary || 0);
  const debounceTimer = useRef(null);

  // Sync local min salary state when filters change externally (e.g. Reset)
  useEffect(() => {
    setLocalMinSalary(filters.minSalary || 0);
  }, [filters.minSalary]);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleSalarySliderChange = (e) => {
    const val = Number(e.target.value);
    setLocalMinSalary(val);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onChange({ ...filters, minSalary: val });
    }, 150); // 150ms debounce eliminates continuous drag lag/blinking
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <motion.aside
      className="mp-filter-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mp-filter-header">
        <h3 className="mp-filter-title">Filters</h3>
        <button className="mp-filter-reset" onClick={onReset}>Reset</button>
      </div>

      {/* Job Type */}
      <div className="mp-filter-section">
        <p className="mp-filter-label">Job Type</p>
        <div className="mp-filter-options">
          {JOB_TYPES.map((type) => (
            <label key={type} className="mp-filter-option">
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={filters.jobType === type}
                onChange={() => handleChange('jobType', type)}
              />
              <span className="mp-filter-option-label">{type}</span>
            </label>
          ))}
          <label className="mp-filter-option">
            <input
              type="radio"
              name="jobType"
              value=""
              checked={!filters.jobType}
              onChange={() => handleChange('jobType', '')}
            />
            <span className="mp-filter-option-label">Any</span>
          </label>
        </div>
      </div>

      {/* Experience Level */}
      <div className="mp-filter-section">
        <p className="mp-filter-label">Experience Level</p>
        <div className="mp-filter-options">
          {EXP_LEVELS.map((level) => (
            <label key={level} className="mp-filter-option">
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={filters.experienceLevel === level}
                onChange={() => handleChange('experienceLevel', level)}
              />
              <span className="mp-filter-option-label">{level}</span>
            </label>
          ))}
          <label className="mp-filter-option">
            <input
              type="radio"
              name="experienceLevel"
              value=""
              checked={!filters.experienceLevel}
              onChange={() => handleChange('experienceLevel', '')}
            />
            <span className="mp-filter-option-label">Any</span>
          </label>
        </div>
      </div>

      {/* Salary Range */}
      <div className="mp-filter-section">
        <p className="mp-filter-label">Min Salary</p>
        <input
          type="range"
          min="0"
          max="200000"
          step="10000"
          value={localMinSalary}
          onChange={handleSalarySliderChange}
          className="mp-filter-range"
        />
        <p className="mp-filter-range-value">
          ${Number(localMinSalary).toLocaleString()}+
        </p>
      </div>

      {/* Sort */}
      <div className="mp-filter-section">
        <p className="mp-filter-label">Sort By</p>
        <select
          className="mp-filter-select"
          value={filters.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="salary_high">Salary: High to Low</option>
          <option value="salary_low">Salary: Low to High</option>
        </select>
      </div>
    </motion.aside>
  );
};

export default FilterPanel;

