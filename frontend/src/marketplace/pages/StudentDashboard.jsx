import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, FileText, CheckCircle, Image, Globe, Plus, Trash2, Send, Clock, BookOpen, UserCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  
  // States for applied jobs tracking
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  
  // Profile Editor states
  const [editing, setEditing] = useState(false);
  const [wizardStarted, setWizardStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Fields matching seeker profile from just_job
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('Graphic Designer');
  const [experienceType, setExperienceType] = useState('months');
  const [experienceValue, setExperienceValue] = useState(0);
  const [skillsStr, setSkillsStr] = useState('');
  const [selectedTools, setSelectedTools] = useState([]);
  const [gmail, setGmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [schooling, setSchooling] = useState('');
  const [aboutThem, setAboutThem] = useState('');
  const [relocate, setRelocate] = useState(false);
  const [languagesList, setLanguagesList] = useState([{ language: 'English', fluency: 'Fluent' }]);
  const [projects, setProjects] = useState([
    { title: '', description: '', link: '' },
    { title: '', description: '', link: '' },
    { title: '', description: '', link: '' },
    { title: '', description: '', link: '' }
  ]);
  
  // Simulated file states or URLs
  const [resumeUrl, setResumeUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [workSamples, setWorkSamples] = useState([]);

  // Track Applications popup modal state
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const calculateCompleteness = () => {
    let score = 0;
    if (fullName.trim()) score += 10;
    if (gmail.trim()) score += 10;
    if (skillsStr.trim()) score += 10;
    if (selectedTools.length > 0) score += 10;
    if (languagesList.length > 0 && languagesList[0].language.trim()) score += 10;
    if (schooling.trim()) score += 10;
    if (aboutThem.trim()) score += 10;
    if (projects.filter(p => p.title.trim()).length > 0) score += 10;
    if (resumeUrl.trim()) score += 10;
    if (photoUrl.trim() || workSamples.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const languagesStr = languagesList.map(l => l.language).filter(Boolean).join(', ');

  // Define tools lists
  const graphicTools = ['Photoshop', 'Illustrator', 'CorelDRAW', 'Canva', 'Figma'];
  const uiuxTools = ['Figma', 'Adobe XD', 'Framer', 'Midjourney', 'ChatGPT', 'Runway', 'Adobe Firefly'];
  const motionTools = ['After Effects', 'Premiere Pro', 'Cinema 4D', 'Blender', 'Maya', 'Figma'];
  const monthOptions = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const yearOptions = ['2023', '2024', '2025', '2026', '2027'];

  // Initialize fields with profile data if profile exists
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || user?.name || '');
      setPosition(profile.position || 'Graphic Designer');
      setExperienceType(profile.experienceType || 'months');
      setExperienceValue(profile.experienceValue || 0);
      setSkillsStr(profile.skills ? profile.skills.join(', ') : '');
      setSelectedTools(profile.tools || []);
      setGmail(profile.gmail || user?.email || '');
      setPortfolioUrl(profile.portfolioUrl || '');
      setSchooling(profile.schooling || '');
      setAboutThem(profile.bio || '');
      setRelocate(profile.relocate || false);
      setResumeUrl(profile.resume || '');
      setPhotoUrl(profile.photoUrl || '');
      setWorkSamples(profile.workSamples || []);
      
      if (Array.isArray(profile.languages) && profile.languages.length > 0) {
        setLanguagesList(profile.languages);
      } else {
        setLanguagesList([{ language: 'English', fluency: 'Fluent' }]);
      }
      
      if (Array.isArray(profile.projects) && profile.projects.length >= 4) {
        setProjects(profile.projects);
      } else {
        setProjects([
          { title: '', description: '', link: '' },
          { title: '', description: '', link: '' },
          { title: '', description: '', link: '' },
          { title: '', description: '', link: '' }
        ]);
      }
    } else {
      if (user) {
        setFullName(user.name || '');
        setGmail(user.email || '');
      }
      setSchooling('');
      setAboutThem('');
      setRelocate(false);
      setLanguagesList([{ language: 'English', fluency: 'Fluent' }]);
      setProjects([
        { title: '', description: '', link: '' },
        { title: '', description: '', link: '' },
        { title: '', description: '', link: '' },
        { title: '', description: '', link: '' }
      ]);
    }
  }, [profile, user]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const { data } = await axiosInstance.get('/applications');
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleToolToggle = (tool) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handlePositionChange = (e) => {
    const pos = e.target.value;
    setPosition(pos);
    setSelectedTools([]);
  };

  const handleProjectChange = (idx, field, val) => {
    const updated = [...projects];
    updated[idx][field] = val;
    setProjects(updated);
  };

  const handleAddLanguage = () => {
    setLanguagesList([...languagesList, { language: '', fluency: 'Beginner' }]);
  };

  const handleRemoveLanguage = (idx) => {
    setLanguagesList(languagesList.filter((_, i) => i !== idx));
  };

  const handleLanguageChange = (idx, field, val) => {
    const updated = [...languagesList];
    updated[idx][field] = val;
    setLanguagesList(updated);
  };

  const handleQuickSkip = async () => {
    try {
      setFormLoading(true);
      setFormError('');
      setFormSuccess('');
      
      const profileData = {
        fullName: user?.name || 'Designer Seeker',
        position: 'Graphic Designer',
        experienceType: 'months',
        experienceValue: 0,
        skills: ['Graphic Design', 'Figma'],
        tools: ['Figma', 'Photoshop'],
        gmail: user?.email || '',
        bio: 'No bio added yet.',
        languages: [{ language: 'English', fluency: 'Fluent' }],
        resume: 'https://example.com/mock-resume.pdf',
        photoUrl: '',
        workSamples: [],
        portfolioUrl: '',
        schooling: 'Not specified',
        projects: [
          { title: 'Project 1', description: 'Design project case study', link: 'https://behance.net' },
          { title: '', description: '', link: '' },
          { title: '', description: '', link: '' },
          { title: '', description: '', link: '' }
        ],
        relocate: false,
        level: 'beginner'
      };

      await axiosInstance.put('/students/profile', profileData);
      setFormSuccess('Draft profile initialized! Loading portfolio...');
      
      if (refreshProfile) await refreshProfile();
      setTimeout(() => {
        setWizardStarted(false);
        setEditing(false);
        setFormSuccess('');
      }, 1000);
    } catch (err) {
      console.error('Error initializing skeleton profile:', err);
      setFormError('Error occurred during skip.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitProfile = async (e, isFinal = true) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Val experience bounds
    const expVal = Number(experienceValue);
    if (experienceType === 'months') {
      if (expVal < 0 || expVal > 11) {
        setFormError('Experience in months must be between 0 and 11.');
        return;
      }
    } else {
      if (expVal < 0 || expVal > 1) {
        setFormError('Experience in years must be 0 or 1.');
        return;
      }
    }

    const cleanProjects = projects.map((p) => ({
      title: p.title?.trim() || '',
      description: p.description?.trim() || '',
      link: p.link?.trim() || ''
    }));

    const cleanLanguages = languagesList.filter(l => l.language?.trim());

    try {
      setFormLoading(true);

      const profileData = {
        fullName: fullName.trim() || user?.name || 'Designer Seeker',
        position: position,
        experienceType: experienceType,
        experienceValue: Number(experienceValue) || 0,
        skills: skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        tools: selectedTools || [],
        gmail: gmail.trim() || user?.email || '',
        bio: aboutThem.trim() || 'No bio added yet.',
        languages: cleanLanguages,
        resume: resumeUrl.trim() || 'https://example.com/resume.pdf',
        photoUrl: photoUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || user?.name}`,
        workSamples: workSamples,
        portfolioUrl: portfolioUrl.trim() || '',
        schooling: schooling.trim() || 'Not specified',
        projects: cleanProjects,
        relocate: relocate,
        level: calculateCompleteness() > 70 ? 'advanced' : calculateCompleteness() > 40 ? 'intermediate' : 'beginner'
      };

      await axiosInstance.put('/students/profile', profileData);

      setFormSuccess(isFinal ? 'Profile saved successfully! Welcome to your premium portfolio.' : 'Draft progress saved successfully!');
      setEditing(false);
      setWizardStarted(false);
      
      if (refreshProfile) await refreshProfile();
      fetchApplications();
      
      setTimeout(() => {
        setFormSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Error saving profile details:', err);
      setFormError(err.response?.data?.message || 'Error occurred while saving profile.');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'cracked':
      case 'accepted':
        return <span className="mp-badge mp-badge-success" style={{ fontWeight: 'bold' }}>🎉 CRACKED</span>;
      case 'rejected':
        return <span className="mp-badge mp-badge-danger">Rejected</span>;
      default:
        return <span className="mp-badge mp-badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending</span>;
    }
  };

  // Welcome page if no profile exists and wizard hasn't started
  if (!profile && !wizardStarted) {
    return (
      <div className="mp-page animate-fade-in">
        <div style={{
          maxWidth: '650px',
          margin: '40px auto',
          padding: '40px',
          borderRadius: 'var(--mp-radius-lg)',
          boxShadow: 'var(--mp-shadow-lg)',
          borderTop: '6px solid var(--mp-primary)',
          textAlign: 'center',
          background: 'var(--mp-bg-card)',
          border: '1px solid var(--mp-border)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--mp-primary) 0%, #00ADB5 100%)',
            color: 'white',
            fontWeight: '800',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 24px auto',
            boxShadow: '0 8px 20px rgba(0, 173, 181, 0.2)'
          }}>
            JJ
          </div>
          
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--mp-text-primary)', marginBottom: '12px' }}>
            Welcome to <span style={{ color: 'var(--mp-primary)' }}>TalentBridge AI</span>!
          </h1>
          <p style={{ color: 'var(--mp-text-secondary)', fontSize: '15.5px', lineHeight: '1.6', marginBottom: '32px' }}>
            Hi, <strong>{user?.name}</strong>! Let's get your job search started. To apply to job openings, you'll need a profile with a resume. You can complete your profile now, or skip and fill it in later!
          </p>

          {formError && (
            <div className="mp-alert mp-alert-error" style={{ marginBottom: '20px' }}>
              <AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mp-alert mp-alert-success" style={{ marginBottom: '20px' }}>
              {formSuccess}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button 
              onClick={() => {
                setFormError('');
                setWizardStarted(true);
              }} 
              className="mp-btn-primary" 
              style={{ padding: '14px 28px', fontSize: '16px', width: '100%', fontWeight: '700' }}
              disabled={formLoading}
            >
              🎨 Build My Jobseeker Profile (2 mins)
            </button>
            <button 
              onClick={handleQuickSkip} 
              className="mp-btn-outline" 
              style={{ padding: '14px 28px', fontSize: '15px', width: '100%', border: '2px solid var(--mp-border)', color: 'var(--mp-text-primary)', fontWeight: '600' }}
              disabled={formLoading}
            >
              ⚡ {formLoading ? 'Setting up...' : 'Fill Up Later (Skip For Now)'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WIZARD / PROFILE FORM
  if (editing || (!profile && wizardStarted)) {
    const currentToolsList = 
      position === 'Graphic Designer' 
        ? graphicTools 
        : position === 'Motion Graphic Designer' 
        ? motionTools 
        : uiuxTools;

    const handleFillLater = () => {
      setWizardStarted(false);
      setEditing(false);
      navigate('/jobs');
    };

    return (
      <div className="mp-page animate-fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px 0' }}>
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', borderTop: '5px solid var(--mp-primary)', padding: '24px 32px', background: 'var(--mp-bg-card)', borderRadius: 'var(--mp-radius-lg)', border: '1px solid var(--mp-border)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--mp-text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User style={{ color: 'var(--mp-primary)' }} />
                {profile ? 'Edit Your Seeker Profile' : 'Create Your Seeker Profile'}
              </h2>
              <p style={{ color: 'var(--mp-text-secondary)', fontSize: '13.5px', margin: 0 }}>
                Fill in as much details as you want. You can save your draft and exit anytime!
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              backgroundColor: 'rgba(0, 173, 181, 0.1)',
              padding: '8px 14px',
              borderRadius: 'var(--mp-radius-md)',
              border: '1px solid rgba(0, 173, 181, 0.2)',
              minWidth: '160px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--mp-primary)' }}>Profile Strength</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--mp-primary)' }}>{calculateCompleteness()}%</span>
                <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--mp-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${calculateCompleteness()}%`, height: '100%', backgroundColor: 'var(--mp-primary)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            </div>
          </div>

          {formError && (
            <div className="mp-alert mp-alert-error" style={{ marginBottom: '16px', flexShrink: 0 }}>
              <AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mp-alert mp-alert-success" style={{ marginBottom: '16px', flexShrink: 0 }}>
              {formSuccess}
            </div>
          )}

          {/* Horizontal Steps Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: 'var(--mp-bg-card-hover)',
            padding: '12px 16px',
            borderRadius: 'var(--mp-radius-md)',
            border: '1px solid var(--mp-border)',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '8px',
            flexShrink: 0
          }}>
            {[
              { step: 1, label: 'Bio & Role' },
              { step: 2, label: 'Skills & Tools' },
              { step: 3, label: 'Portfolio & Work' },
              { step: 4, label: 'Uploads' }
            ].map((s) => (
              <div 
                key={s.step} 
                className={`wizard-step-node ${currentStep === s.step ? 'active' : ''}`}
                onClick={() => {
                  setFormError('');
                  setCurrentStep(s.step);
                }}
                style={{ flex: 1, textAlign: 'center', cursor: 'pointer', minWidth: '80px' }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: currentStep === s.step ? 'var(--mp-primary)' : currentStep > s.step ? '#00ADB5' : 'var(--mp-border)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', margin: '0 auto 4px auto', fontSize: '12px'
                }}>
                  {currentStep > s.step ? '✓' : s.step}
                </div>
                <span style={{ fontSize: '11px', color: currentStep === s.step ? 'var(--mp-primary)' : 'var(--mp-text-secondary)', fontWeight: '600' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (currentStep < 4) setCurrentStep(currentStep + 1); else handleSubmitProfile(e, true); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            
            {/* Scrollable form body containing the step fields */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }} className="mp-wizard-step-body">
              
              {/* STEP 1: Bio & Role (Split Column Layout) */}
              {currentStep === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  {/* Left Column: Form Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Target Role Details
                    </h3>
                    
                    <div className="mp-field">
                      <label className="mp-field-label">Full Name</label>
                      <input
                        type="text"
                        className="mp-field-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="mp-field">
                      <label className="mp-field-label">Gmail Address</label>
                      <input
                        type="email"
                        className="mp-field-input"
                        value={gmail}
                        onChange={(e) => setGmail(e.target.value)}
                        placeholder="name@gmail.com"
                      />
                    </div>

                    <div className="mp-field">
                      <label className="mp-field-label">Target Role Position</label>
                      <select className="mp-field-input" value={position} onChange={handlePositionChange} style={{ background: 'var(--mp-bg-input)' }}>
                        <option value="Graphic Designer">Graphic Designer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Motion Graphic Designer">Motion Graphic Designer</option>
                      </select>
                    </div>

                    <div className="mp-field">
                      <label className="mp-field-label">Experience Level</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="number"
                          min={0}
                          max={experienceType === 'months' ? 11 : 1}
                          className="mp-field-input"
                          style={{ flex: 1 }}
                          value={experienceValue}
                          onChange={(e) => setExperienceValue(Number(e.target.value))}
                        />
                        <select
                          className="mp-field-input"
                          style={{ flex: 1, background: 'var(--mp-bg-input)' }}
                          value={experienceType}
                          onChange={(e) => {
                            setExperienceType(e.target.value);
                            setExperienceValue(0);
                          }}
                        >
                          <option value="months">Months (0-11)</option>
                          <option value="years">Years (0-1)</option>
                        </select>
                      </div>
                      <small style={{ color: 'var(--mp-text-secondary)', display: 'block', marginTop: '4px' }}>
                        Must be under 1 year.
                      </small>
                    </div>
                  </div>

                  {/* Right Column: Bio (About Me) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      About Me
                    </h3>
                    <div className="mp-field" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <label className="mp-field-label">Professional Biography</label>
                      <textarea
                        className="mp-field-input"
                        value={aboutThem}
                        onChange={(e) => setAboutThem(e.target.value)}
                        placeholder="Introduce yourself to recruiters! Describe your creative design style, background, interests, and career goals..."
                        style={{ resize: 'none', flex: 1, minHeight: '220px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Skills & Software (Split Column Layout) */}
              {currentStep === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                  {/* Left Column: Core Skills Tags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Core Expertise
                    </h3>
                    <div className="mp-field">
                      <label className="mp-field-label">Core Skills (Comma separated tags)</label>
                      <input
                        type="text"
                        className="mp-field-input"
                        value={skillsStr}
                        onChange={(e) => setSkillsStr(e.target.value)}
                        placeholder="e.g. Wireframing, Brand Identity, Mobile Layouts, Prototyping, Typography"
                      />
                      <small style={{ color: 'var(--mp-text-secondary)', marginTop: '8px', display: 'block' }}>
                        These keywords will be evaluated by our AI matching algorithm to score your profile against active job openings.
                      </small>
                    </div>
                  </div>

                  {/* Right Column: Tools Checkbox Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Software & Tools
                    </h3>
                    <div className="mp-field">
                      <label className="mp-field-label">Select all tools you use as a <strong>{position}</strong></label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '8px' }}>
                        {currentToolsList.map((tool) => (
                          <label key={tool} style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderRadius: 'var(--mp-radius-md)',
                            border: selectedTools.includes(tool) ? '2px solid var(--mp-primary)' : '1px solid var(--mp-border)',
                            backgroundColor: selectedTools.includes(tool) ? 'rgba(0, 173, 181, 0.08)' : 'var(--mp-bg-card-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                          }}>
                            <input
                              type="checkbox"
                              checked={selectedTools.includes(tool)}
                              onChange={() => handleToolToggle(tool)}
                              style={{ accentColor: 'var(--mp-primary)' }}
                            />
                            <span style={{ fontSize: '12.5px', fontWeight: selectedTools.includes(tool) ? '700' : '500', color: 'var(--mp-text-primary)' }}>{tool}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Portfolio & Background (Split Layout) */}
              {currentStep === 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
                  {/* Left Column: Education and Languages */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Background & Links
                    </h3>

                    <div className="mp-field">
                      <label className="mp-field-label">Schooling & Education Details</label>
                      <textarea
                        rows={2}
                        className="mp-field-input"
                        value={schooling}
                        onChange={(e) => setSchooling(e.target.value)}
                        placeholder="e.g. Bachelor of Design (B.Des) from NID, CGPA 8.2"
                        style={{ resize: 'none' }}
                      />
                    </div>

                    <div className="mp-field">
                      <label className="mp-field-label">Personal Portfolio Link</label>
                      <input
                        type="url"
                        className="mp-field-input"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://behance.net/username or https://myportfolio.com"
                      />
                    </div>

                    <div className="mp-field" style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={relocate}
                          onChange={(e) => setRelocate(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--mp-primary)' }}
                        />
                        <span style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--mp-text-primary)' }}>Open to Relocate?</span>
                      </label>
                    </div>

                    {/* Languages Known */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="mp-field-label" style={{ marginBottom: 0 }}>Languages Known</label>
                        <button
                          type="button"
                          onClick={handleAddLanguage}
                          className="mp-btn-ghost-sm"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                        >
                          + Add
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {languagesList.map((lang, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Language (e.g. English)"
                              className="mp-field-input"
                              value={lang.language}
                              onChange={(e) => handleLanguageChange(idx, 'language', e.target.value)}
                              style={{ flex: 2, fontSize: '12.5px', padding: '6px 10px' }}
                            />
                            <select
                              className="mp-field-input"
                              value={lang.fluency}
                              onChange={(e) => handleLanguageChange(idx, 'fluency', e.target.value)}
                              style={{ flex: 1, fontSize: '12.5px', padding: '6px 10px', background: 'var(--mp-bg-input)' }}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Fluent">Fluent</option>
                            </select>
                            {languagesList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLanguage(idx)}
                                style={{ padding: '6px 10px', background: '#e74c3c', border: 'none', color: 'white', borderRadius: 'var(--mp-radius-md)', cursor: 'pointer', fontSize: '11px' }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Projects grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Top 4 Projects
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {projects.map((proj, idx) => (
                        <div key={idx} style={{ padding: '12px', backgroundColor: 'var(--mp-bg-card-hover)', border: '1px solid var(--mp-border)', borderRadius: 'var(--mp-radius-md)' }}>
                          <h4 style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--mp-text-primary)', fontWeight: 'bold' }}>Project #{idx + 1}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input
                              type="text"
                              className="mp-field-input"
                              style={{ fontSize: '11.5px', padding: '6px' }}
                              value={proj.title}
                              onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                              placeholder="Project Title"
                            />
                            <input
                              type="url"
                              className="mp-field-input"
                              style={{ fontSize: '11.5px', padding: '6px' }}
                              value={proj.link}
                              onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                              placeholder="Project Link (e.g. Behance)"
                            />
                            <textarea
                              rows={1}
                              className="mp-field-input"
                              style={{ fontSize: '11.5px', padding: '6px', resize: 'none' }}
                              value={proj.description}
                              onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                              placeholder="Short description..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Uploads (Split Column Layout) */}
              {currentStep === 4 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  {/* Left Column: Document Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Core Documents
                    </h3>

                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: 'rgba(0, 173, 181, 0.05)',
                      border: '1px solid rgba(0, 173, 181, 0.15)',
                      borderRadius: 'var(--mp-radius-md)',
                      color: 'var(--mp-primary)',
                      fontSize: '12.5px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FileText size={16} />
                      <span><strong>Application Requirement:</strong> A hosted resume link is mandatory to apply for roles.</span>
                    </div>

                    <div className="mp-field">
                      <label className="mp-field-label">Resume PDF Link/URL *</label>
                      <input
                        type="url"
                        className="mp-field-input"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://drive.google.com/your-resume-pdf"
                        required
                      />
                      <small style={{ color: 'var(--mp-text-secondary)' }}>Upload your resume to Drive or Dropbox and paste the link here.</small>
                    </div>

                    <div className="mp-field">
                      <label className="mp-field-label">Profile Image URL</label>
                      <input
                        type="url"
                        className="mp-field-input"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                      <small style={{ color: 'var(--mp-text-secondary)' }}>Provide an image link to show on your candidate profile card.</small>
                    </div>
                  </div>

                  {/* Right Column: Work Samples */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--mp-primary)', borderBottom: '1.5px solid var(--mp-border)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Portfolio Work Showcase
                    </h3>
                    
                    <div className="mp-field">
                      <label className="mp-field-label">Work Sample 1 URL</label>
                      <input
                        type="url"
                        className="mp-field-input"
                        value={workSamples[0] || ''}
                        onChange={(e) => {
                          const updated = [...workSamples];
                          updated[0] = e.target.value;
                          setWorkSamples(updated);
                        }}
                        placeholder="Project Showcase Image 1 Link"
                      />
                    </div>
                    <div className="mp-field">
                      <label className="mp-field-label">Work Sample 2 URL</label>
                      <input
                        type="url"
                        className="mp-field-input"
                        value={workSamples[1] || ''}
                        onChange={(e) => {
                          const updated = [...workSamples];
                          updated[1] = e.target.value;
                          setWorkSamples(updated);
                        }}
                        placeholder="Project Showcase Image 2 Link"
                      />
                    </div>
                    <div className="mp-field">
                      <label className="mp-field-label">Work Sample 3 URL</label>
                      <input
                        type="url"
                        className="mp-field-input"
                        value={workSamples[2] || ''}
                        onChange={(e) => {
                          const updated = [...workSamples];
                          updated[2] = e.target.value;
                          setWorkSamples(updated);
                        }}
                        placeholder="Project Showcase Image 3 Link"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Action Footer (Fixed, non-scrollable) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1.5px solid var(--mp-border)',
              paddingTop: '16px',
              marginTop: '16px',
              flexShrink: 0
            }}>
              <div>
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormError('');
                      setCurrentStep(currentStep - 1);
                    }} 
                    className="mp-btn-outline"
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >
                    Back
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleFillLater} 
                    className="mp-btn-outline"
                    style={{ padding: '8px 20px', fontSize: '13px', border: '1.5px solid var(--mp-border)', color: 'var(--mp-text-secondary)' }}
                  >
                    Fill Up Later
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={(e) => handleSubmitProfile(e, false)} 
                  disabled={formLoading} 
                  className="mp-btn-ghost"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {formLoading ? 'Saving...' : 'Save Draft'}
                </button>

                {currentStep < 4 ? (
                  <button 
                    type="submit" 
                    className="mp-btn-primary"
                    style={{ padding: '8px 24px', fontSize: '13px' }}
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={formLoading} 
                    className="mp-btn-primary"
                    style={{ padding: '8px 28px', fontSize: '13px', backgroundColor: '#2ecc71' }}
                  >
                    {formLoading ? 'Saving...' : 'Finish & Complete'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
            


  // PORTFOLIO VIEW
  return (
    <div className="mp-page animate-fade-in" style={{ padding: '20px 0' }}>
      
      {calculateCompleteness() < 100 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(232, 243, 255, 0.1) 0%, rgba(254, 243, 199, 0.15) 100%)',
          border: '1px solid rgba(241, 196, 15, 0.3)',
          padding: '20px 30px',
          borderRadius: 'var(--mp-radius-lg)',
          marginBottom: '30px',
          boxShadow: 'var(--mp-shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: '#f1c40f',
              color: '#1a1a1a',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--mp-text-primary)', margin: '0 0 4px 0' }}>
                Your profile is only {calculateCompleteness()}% complete!
              </h3>
              <p style={{ color: 'var(--mp-text-secondary)', fontSize: '13.5px', margin: 0 }}>
                {!resumeUrl 
                  ? '⚠️ Critical: You must upload a resume URL before you can apply to any job openings.'
                  : 'A fully completed profile stands out to hiring managers. Complete the rest of the steps to increase your hireability!'
                }
              </p>
            </div>
            <button 
              onClick={() => {
                setFormError('');
                setEditing(true);
                setCurrentStep(1);
              }} 
              className="mp-btn-primary"
              style={{ backgroundColor: '#f1c40f', color: '#1a1a1a', border: 'none' }}
            >
              Complete Profile
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%', fontSize: '12px', color: 'var(--mp-text-secondary)', borderTop: '1px solid var(--mp-border)', paddingTop: '14px', marginTop: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>Remaining:</span>
            {(!fullName.trim() || fullName === 'Designer Seeker') && <span>❌ Full Name</span>}
            {(!gmail.trim() || gmail === '') && <span>❌ Gmail</span>}
            {(!skillsStr.trim()) && <span>❌ Skills list</span>}
            {selectedTools.length === 0 && <span>❌ Software Tools</span>}
            {(!schooling.trim()) && <span>❌ Schooling details</span>}
            {(!resumeUrl) && <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>❌ Resume (Required to Apply)</span>}
            {(!photoUrl) && <span>❌ Profile Photo</span>}
            {projects.filter(p => p.title.trim()).length === 0 && <span>❌ Projects</span>}
          </div>
        </div>
      )}

      {/* Hero Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 173, 181, 0.1) 0%, rgba(57, 62, 70, 0.4) 100%)',
        border: '1px solid var(--mp-border)',
        borderRadius: 'var(--mp-radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        boxShadow: 'var(--mp-shadow-sm)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--mp-text-primary)', margin: 0 }}>
            Welcome back, {fullName || user?.name}! 👋
          </h2>
          <p style={{ color: 'var(--mp-text-secondary)', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
            Manage your developer application logs, portfolios, and job status in one unified dashboard.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setEditing(true)} className="mp-btn-primary">
            Edit Portfolio
          </button>
          <Link to="/jobs" className="mp-btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Browse Jobs
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '30px' }} className="seeker-dashboard-grid">
        
        {/* Left Column: Seeker Profile details preview */}
        <div>
          <div style={{
            backgroundColor: 'var(--mp-bg-card)',
            border: '1px solid var(--mp-border)',
            borderRadius: 'var(--mp-radius-lg)',
            padding: '30px',
            textAlign: 'center',
            boxShadow: 'var(--mp-shadow-sm)',
            position: 'sticky',
            top: '20px'
          }}>
            
            {/* Candidate Photo */}
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px auto', border: '3px solid var(--mp-primary)' }}>
              <img 
                src={photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || user?.name}`} 
                alt={fullName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <h2 style={{ fontSize: '22px', color: 'var(--mp-text-primary)', marginBottom: '4px', fontWeight: '800' }}>{fullName}</h2>
            <span className="mp-badge mp-badge-primary" style={{ marginBottom: '20px', fontSize: '12px' }}>{position}</span>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', borderTop: '1px solid var(--mp-border)', paddingTop: '20px' }}>
              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About Me</strong>
                <span style={{ display: 'block', whiteSpace: 'pre-line', lineHeight: '1.4', color: 'var(--mp-text-primary)' }}>{aboutThem || 'No bio added yet.'}</span>
              </div>
              
              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience</strong>
                <span style={{ fontWeight: '600', color: 'var(--mp-text-primary)' }}>{experienceValue} {experienceType} (Fresher)</span>
              </div>
              
              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gmail Address</strong>
                <span style={{ color: 'var(--mp-text-primary)' }}>{gmail}</span>
              </div>

              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Languages Known</strong>
                <span style={{ color: 'var(--mp-text-primary)' }}>
                  {languagesList.map(l => `${l.language} (${l.fluency})`).join(', ') || 'None listed'}
                </span>
              </div>

              {portfolioUrl && (
                <div>
                  <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Website</strong>
                  <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--mp-primary)', textDecoration: 'none' }}>
                    <Globe size={14} /> View Portfolio Links ↗
                  </a>
                </div>
              )}

              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Open to Relocate?</strong>
                <span style={{ color: 'var(--mp-text-primary)' }}>{relocate ? '✅ Yes' : '❌ No'}</span>
              </div>

              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Schooling / Education</strong>
                <span style={{ color: 'var(--mp-text-primary)' }}>{schooling || 'Not specified'}</span>
              </div>

              {resumeUrl && (
                <div>
                  <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resume PDF</strong>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#00ADB5', textDecoration: 'none' }}>
                    <FileText size={14} /> Open Resume PDF ↗
                  </a>
                </div>
              )}

              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Software & Tools</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedTools.map((t, idx) => (
                    <span key={idx} className="mp-skill-chip" style={{ fontSize: '11px', padding: '4px 8px' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--mp-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Core Skills</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skillsStr.split(',').map((s) => s.trim()).filter(Boolean).map((s, idx) => (
                    <span key={idx} className="mp-skill-chip" style={{ fontSize: '11px', padding: '4px 8px', background: '#393E46' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setEditing(true)} className="mp-btn-outline" style={{ width: '100%', marginTop: '24px' }}>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right Column: Applications Tracker & Action block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Track Applications Modal Trigger Card */}
          <div style={{
            backgroundColor: 'var(--mp-bg-card)',
            border: '1px solid var(--mp-border)',
            borderRadius: 'var(--mp-radius-lg)',
            padding: '24px 30px',
            boxShadow: 'var(--mp-shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--mp-text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                <BookOpen size={18} style={{ color: 'var(--mp-primary)' }} />
                Application History
              </h3>
              <p style={{ color: 'var(--mp-text-secondary)', fontSize: '13px', margin: 0 }}>
                You have applied to {applications.length} job opportunities.
              </p>
            </div>
            <button 
              onClick={() => setShowAppsModal(true)} 
              className="mp-btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              Track Applications
            </button>
          </div>

          {/* Top 4 Portfolio Projects Grid */}
          <div style={{
            backgroundColor: 'var(--mp-bg-card)',
            border: '1px solid var(--mp-border)',
            borderRadius: 'var(--mp-radius-lg)',
            padding: '24px 30px',
            boxShadow: 'var(--mp-shadow-sm)'
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--mp-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <Globe size={18} style={{ color: 'var(--mp-primary)' }} />
              Top 4 Portfolio Projects
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {projects.filter(proj => proj.title?.trim() || proj.description?.trim()).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--mp-text-secondary)', fontSize: '13px', gridColumn: '1 / -1' }}>
                  No portfolio projects added yet.
                </div>
              ) : (
                projects
                  .filter(proj => proj.title?.trim() || proj.description?.trim())
                  .map((proj, idx) => (
                    <div key={idx} style={{ padding: '16px', backgroundColor: 'var(--mp-bg-card-hover)', border: '1px solid var(--mp-border)', borderRadius: 'var(--mp-radius-md)' }}>
                      <h4 style={{ fontSize: '15px', color: 'var(--mp-text-primary)', margin: '0 0 6px 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {proj.title || 'Untitled Project'}
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--mp-primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                            Link ↗
                          </a>
                        )}
                      </h4>
                      <p style={{ color: 'var(--mp-text-secondary)', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                        {proj.description}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
          
          {/* Work samples Gallery Grid */}
          <div style={{
            backgroundColor: 'var(--mp-bg-card)',
            border: '1px solid var(--mp-border)',
            borderRadius: 'var(--mp-radius-lg)',
            padding: '24px 30px',
            boxShadow: 'var(--mp-shadow-sm)'
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--mp-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <Image size={18} style={{ color: 'var(--mp-primary)' }} />
              Portfolio Work Samples
            </h3>
            {workSamples.filter(Boolean).length === 0 ? (
              <div style={{ padding: '30px', border: '1px dashed var(--mp-border)', borderRadius: 'var(--mp-radius-md)', textAlign: 'center', color: 'var(--mp-text-secondary)', fontSize: '13px' }}>
                No portfolio work sample image links added yet. Click Edit Profile to add hosted image URLs.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {workSamples.filter(Boolean).map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxImage(img)}
                    style={{ 
                      aspectRatio: '4/3', 
                      borderRadius: 'var(--mp-radius-md)', 
                      overflow: 'hidden', 
                      border: '1px solid var(--mp-border)', 
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img src={img} alt={`Work Sample ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.4)',
                      opacity: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = 1}
                    onMouseLeave={(e) => e.target.style.opacity = 0}
                    >
                      🔍 Zoom
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Track Applications Modal */}
      {showAppsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px'
        }} onClick={() => setShowAppsModal(false)}>
          <div style={{
            backgroundColor: 'var(--mp-bg-card)',
            border: '1px solid var(--mp-border)',
            borderRadius: 'var(--mp-radius-lg)',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAppsModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--mp-text-secondary)', fontSize: '18px' }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '22px', color: 'var(--mp-text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <Clock size={20} style={{ color: 'var(--mp-primary)' }} />
              Track Applications
            </h2>
            <p style={{ color: 'var(--mp-text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Monitor the status of your submitted job applications.
            </p>

            {loadingApps ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>Loading applications...</div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mp-text-secondary)', border: '1px dashed var(--mp-border)', borderRadius: 'var(--mp-radius-md)' }}>
                You haven't applied to any job listings yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applications.map((app) => (
                  <div key={app._id} style={{ padding: '16px 20px', backgroundColor: 'var(--mp-bg-card-hover)', border: '1px solid var(--mp-border)', borderRadius: 'var(--mp-radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', color: 'var(--mp-text-primary)', margin: 0, fontWeight: 'bold' }}>
                          {app.job ? app.job.title : 'Position'}
                        </h4>
                        <span style={{ fontSize: '13px', color: 'var(--mp-primary)', fontWeight: '600' }}>
                          {app.job && app.job.company ? app.job.company.companyName : 'Company'}
                        </span>
                      </div>
                      <div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--mp-text-secondary)' }}>
                      <span>📅 Applied on: {new Date(app.createdAt).toLocaleDateString()}</span>
                      <span>📍 {app.job ? app.job.location : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Lightbox Overlay */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxImage} 
              alt="Zoomed Work Sample" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain' }} 
            />
            <button 
              onClick={() => setLightboxImage(null)}
              className="mp-btn-primary"
              style={{
                position: 'absolute',
                top: '-50px',
                right: '0',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px'
              }}
            >
              ✕ Close Zoom
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 800px) {
          .seeker-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .seeker-dashboard-grid > div {
            position: static !important;
          }
        }
      `}} />
    </div>
  );
};

export default StudentDashboard;
