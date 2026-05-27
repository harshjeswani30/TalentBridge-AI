import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead'];

const CreateJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', location: '', jobType: 'full-time',
    experienceLevel: 'entry', requiredSkills: [], salary: { min: '', max: '' },
  });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Job title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (form.salary.min && form.salary.max && Number(form.salary.min) > Number(form.salary.max)) {
      errs.salary = 'Min salary cannot exceed max salary';
    }
    return errs;
  };

  const addSkill = () => {
    const s = skillInput.toLowerCase().trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter((s) => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary: {
          min: Number(form.salary.min) || 0,
          max: Number(form.salary.max) || 0,
        },
      };
      await axiosInstance.post('/jobs', payload);
      navigate('/manage-jobs');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mp-page">
      <motion.div className="mp-page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mp-page-title">Post a New Job</h1>
        <p className="mp-page-sub">Fill in the details to attract the best candidates</p>
      </motion.div>

      <motion.div
        className="mp-auth-card"
        style={{ maxWidth: 760, margin: '0 auto' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {apiError && <div className="mp-alert mp-alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} className="mp-auth-form mp-auth-form-grid">
          <div className="mp-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="mp-form-label">Job Title *</label>
            <input type="text" className={`mp-input ${errors.title ? 'mp-input-error' : ''}`} placeholder="e.g. Senior React Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className="mp-field-error">{errors.title}</p>}
          </div>

          <div className="mp-form-group">
            <label className="mp-form-label">Job Type</label>
            <select className="mp-input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="mp-form-group">
            <label className="mp-form-label">Experience Level</label>
            <select className="mp-input" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
              {EXP_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="mp-form-group">
            <label className="mp-form-label">Location</label>
            <input type="text" className="mp-input" placeholder="e.g. New York, NY or Remote" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>

          <div className="mp-form-group">
            <label className="mp-form-label">Salary Range (USD)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" className="mp-input" placeholder="Min (e.g. 60000)" value={form.salary.min} onChange={(e) => setForm({ ...form, salary: { ...form.salary, min: e.target.value } })} />
              <input type="number" className="mp-input" placeholder="Max (e.g. 100000)" value={form.salary.max} onChange={(e) => setForm({ ...form, salary: { ...form.salary, max: e.target.value } })} />
            </div>
            {errors.salary && <p className="mp-field-error">{errors.salary}</p>}
          </div>

          <div className="mp-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="mp-form-label">Required Skills</label>
            <div className="mp-skill-input-wrap">
              <input type="text" className="mp-input" placeholder="Type skill and press Enter or Add" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <button type="button" className="mp-btn-add-skill" onClick={addSkill}>Add</button>
            </div>
            <div className="mp-job-skills" style={{ marginTop: 8 }}>
              {form.requiredSkills.map((s) => (
                <span key={s} className="mp-skill-chip mp-skill-chip-removable">
                  {s} <button type="button" onClick={() => removeSkill(s)} className="mp-skill-remove">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="mp-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="mp-form-label">Job Description *</label>
            <textarea className={`mp-input mp-textarea ${errors.description ? 'mp-input-error' : ''}`} placeholder="Describe the role, responsibilities, requirements..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={8} />
            {errors.description && <p className="mp-field-error">{errors.description}</p>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <motion.button type="submit" className="mp-btn-submit" disabled={loading} whileTap={{ scale: 0.98 }}>
              {loading ? <span className="mp-btn-spinner" /> : '🚀 Post Job'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateJob;
