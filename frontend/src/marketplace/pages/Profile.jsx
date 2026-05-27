import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const SKILL_SUGGESTIONS = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'express',
  'python', 'django', 'java', 'go', 'mongodb', 'postgresql', 'mysql', 'redis',
  'docker', 'kubernetes', 'aws', 'git', 'react native', 'flutter',
  'tensorflow', 'pytorch', 'figma', 'jest', 'cypress', 'tailwindcss', 'html', 'css',
];

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (profile) {
      if (user?.role === 'student') {
        setForm({ skills: profile.skills || [], level: profile.level || 'beginner', bio: profile.bio || '' });
      } else {
        setForm({
          companyName: profile.companyName || '',
          description: profile.description || '',
          location: profile.location || '',
          website: profile.website || '',
          industry: profile.industry || '',
        });
      }
    }
  }, [profile, user]);

  const addSkill = (skill) => {
    const s = skill.toLowerCase().trim();
    if (s && !(form.skills || []).includes(s)) {
      setForm({ ...form, skills: [...(form.skills || []), s] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      if (user?.role === 'student') {
        await axiosInstance.put('/students/profile', form);
      } else {
        await axiosInstance.put('/company/profile', form);
      }
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mp-page">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mp-page-header"
      >
        <h1 className="mp-page-title">My Profile</h1>
        <p className="mp-page-sub">Update your {user?.role} information</p>
      </motion.div>

      <motion.div
        className="mp-auth-card"
        style={{ maxWidth: 720, margin: '0 auto' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* User Info Header */}
        <div className="mp-profile-header">
          <div className="mp-profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="mp-detail-job-title">{user?.name}</h2>
            <p className="mp-detail-company-name">{user?.email}</p>
            <span className="mp-role-chip">{user?.role}</span>
          </div>
        </div>

        {success && (
          <motion.div className="mp-alert mp-alert-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ✅ Profile updated successfully!
          </motion.div>
        )}
        {error && (
          <motion.div className="mp-alert mp-alert-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mp-auth-form">
          {user?.role === 'student' ? (
            <>
              {/* Skills */}
              <div className="mp-form-group">
                <label className="mp-form-label">Skills</label>
                <div className="mp-skill-input-wrap">
                  <input
                    type="text"
                    className="mp-input"
                    placeholder="Type a skill and press Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                  />
                  <button type="button" className="mp-btn-add-skill" onClick={() => addSkill(skillInput)}>
                    Add
                  </button>
                </div>
                <div className="mp-skill-suggestions">
                  {SKILL_SUGGESTIONS.filter((s) => s.includes(skillInput.toLowerCase()) && skillInput && !(form.skills || []).includes(s)).slice(0, 6).map((s) => (
                    <button key={s} type="button" className="mp-suggestion-chip" onClick={() => addSkill(s)}>{s}</button>
                  ))}
                </div>
                <div className="mp-job-skills" style={{ marginTop: 8 }}>
                  {(form.skills || []).map((s) => (
                    <span key={s} className="mp-skill-chip mp-skill-chip-removable">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="mp-skill-remove">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mp-form-group">
                <label className="mp-form-label">Experience Level</label>
                <select className="mp-input" value={form.level || 'beginner'} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  {['beginner', 'intermediate', 'advanced', 'expert'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="mp-form-group">
                <label className="mp-form-label">Bio</label>
                <textarea
                  className="mp-input mp-textarea"
                  placeholder="Tell companies about yourself..."
                  value={form.bio || ''}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="mp-char-count">{(form.bio || '').length} / 500</p>
              </div>
            </>
          ) : (
            <>
              <div className="mp-form-group">
                <label className="mp-form-label">Company Name</label>
                <input type="text" className="mp-input" value={form.companyName || ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Industry</label>
                <input type="text" className="mp-input" placeholder="e.g. Technology, Healthcare" value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Location</label>
                <input type="text" className="mp-input" placeholder="San Francisco, CA" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Website</label>
                <input type="url" className="mp-input" placeholder="https://yourcompany.com" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Description</label>
                <textarea className="mp-input mp-textarea" placeholder="Describe your company..." value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} maxLength={1000} />
                <p className="mp-char-count">{(form.description || '').length} / 1000</p>
              </div>
            </>
          )}

          <motion.button type="submit" className="mp-btn-submit" disabled={loading} whileTap={{ scale: 0.98 }}>
            {loading ? <span className="mp-btn-spinner" /> : 'Save Profile'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
