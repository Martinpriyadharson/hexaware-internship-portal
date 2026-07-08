import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  User, BookOpen, MapPin, ShieldAlert, ArrowRight, 
  Save, GraduationCap, CheckCircle2, Info, Mail, Phone, Calendar,
  Globe, Landmark, School, Award, Check
} from 'lucide-react';
import tneaColleges from '../data/tneaColleges.json';

const DEGREES = [
  'B.E. (Bachelor of Engineering)',
  'B.Tech (Bachelor of Technology)',
  'M.E. (Master of Engineering)',
  'M.Tech (Master of Technology)',
  'M.C.A. (Master of Computer Applications)',
  'B.Sc (Bachelor of Science)',
  'M.Sc (Master of Science)',
  'B.C.A. (Bachelor of Computer Applications)',
  'Other'
];

const BRANCHES = [
  'Computer Science and Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Artificial Intelligence and Data Science (AI & DS)',
  'Artificial Intelligence and Machine Learning (AI & ML)',
  'Software Engineering',
  'Computer Science and Business Systems (CSBS)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Other'
];

// Reusable Autocomplete ComboBox component
const SearchableSelect = ({ label, id, value, onChange, options, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-group" style={{ position: 'relative' }} ref={wrapperRef}>
      <label htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 2 }} />}
        <input
          type="text"
          id={id}
          className="form-control"
          value={isOpen ? searchQuery : value}
          onFocus={() => {
            setIsOpen(true);
            setSearchQuery('');
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder || "Select or search..."}
          style={{ paddingLeft: Icon ? '40px' : '14px', paddingRight: '40px', cursor: 'text' }}
          autoComplete="off"
        />
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '0.75rem' }}>▼</span>
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-md)', maxHeight: '240px', overflowY: 'auto',
          zIndex: 999, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)'
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => (
              <div
                key={i}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                style={{
                  padding: '10px 16px', cursor: 'pointer', fontSize: '0.9rem',
                  borderBottom: i < filteredOptions.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none',
                  background: value === opt ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: value === opt ? 'var(--primary)' : 'var(--text-primary)',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={(e) => e.target.style.background = value === opt ? 'rgba(99, 102, 241, 0.1)' : 'transparent'}
              >
                {opt}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
              No matches found. Select "Other" to enter manually.
            </div>
          )}
          
          <div
            onClick={() => {
              onChange('Other');
              setIsOpen(false);
              setSearchQuery('');
            }}
            style={{
              padding: '10px 16px', cursor: 'pointer', fontSize: '0.9rem',
              borderTop: '1.5px solid rgba(255,255,255,0.08)',
              background: value === 'Other' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0,0,0,0.1)',
              color: 'var(--accent-cyan)', fontWeight: '600'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.target.style.background = value === 'Other' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0,0,0,0.1)'}
          >
            Other (Type manually)
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileDetails = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [completeness, setCompleteness] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    gender: '',
    mobile: '',
    
    college: '',
    degree: '',
    branch: '',
    currentYear: '',
    graduationYear: '',
    cgpa: '',
    
    city: '',
    state: '',
    country: 'India',
    
    isInfoAccurate: false,
    isTermsAccepted: false,
  });

  const [customCollege, setCustomCollege] = useState('');
  const [customDegree, setCustomDegree] = useState('');
  const [customBranch, setCustomBranch] = useState('');

  // Pre-fill user data when context is loaded
  useEffect(() => {
    if (user) {
      const dbCollege = user.college || '';
      const dbDegree = user.degree || '';
      const dbBranch = user.branch || '';

      const isCollegeInList = tneaColleges.includes(dbCollege);
      const isDegreeInList = DEGREES.includes(dbDegree);
      const isBranchInList = BRANCHES.includes(dbBranch);

      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        dob: user.dob || '',
        gender: user.gender || '',
        mobile: user.mobile || '',
        college: dbCollege ? (isCollegeInList ? dbCollege : 'Other') : '',
        degree: dbDegree ? (isDegreeInList ? dbDegree : 'Other') : '',
        branch: dbBranch ? (isBranchInList ? dbBranch : 'Other') : '',
        currentYear: user.currentYear || '',
        graduationYear: user.graduationYear || '',
        cgpa: user.cgpa || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        isInfoAccurate: user.isDeclarationConfirmed || false,
        isTermsAccepted: user.isDeclarationConfirmed || false,
      }));

      if (dbCollege && !isCollegeInList) setCustomCollege(dbCollege);
      if (dbDegree && !isDegreeInList) setCustomDegree(dbDegree);
      if (dbBranch && !isBranchInList) setCustomBranch(dbBranch);
    }
  }, [user]);

  // Dynamically calculate profile completeness percentage
  useEffect(() => {
    const fieldsToTrack = [
      'name', 'dob', 'gender', 'mobile', 'college', 'degree', 
      'branch', 'currentYear', 'graduationYear', 'cgpa', 
      'city', 'state', 'country', 'isInfoAccurate', 'isTermsAccepted'
    ];
    
    let filledCount = 0;
    fieldsToTrack.forEach(field => {
      const val = formData[field];
      if (typeof val === 'boolean') {
        if (val === true) filledCount++;
      } else if (val && val.trim() !== '') {
        if (field === 'college' && val === 'Other') {
          if (customCollege.trim() !== '') filledCount++;
        } else if (field === 'degree' && val === 'Other') {
          if (customDegree.trim() !== '') filledCount++;
        } else if (field === 'branch' && val === 'Other') {
          if (customBranch.trim() !== '') filledCount++;
        } else {
          filledCount++;
        }
      }
    });

    const percent = Math.round((filledCount / fieldsToTrack.length) * 100);
    setCompleteness(percent);
  }, [formData, customCollege, customDegree, customBranch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getSubmissionData = (isFinalSubmit = false) => {
    return {
      name: formData.name,
      college: formData.college === 'Other' ? customCollege : formData.college,
      degree: formData.degree === 'Other' ? customDegree : formData.degree,
      branch: formData.branch === 'Other' ? customBranch : formData.branch,
      currentYear: formData.currentYear,
      graduationYear: formData.graduationYear,
      cgpa: formData.cgpa,
      dob: formData.dob,
      gender: formData.gender,
      mobile: formData.mobile,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      isDeclarationConfirmed: isFinalSubmit ? true : (formData.isInfoAccurate && formData.isTermsAccepted),
      isProfileCompleted: isFinalSubmit
    };
  };

  const validateForm = (subData) => {
    if (!subData.name.trim()) return 'Full Name is required';
    if (!subData.dob) return 'Date of Birth is required';
    if (!subData.gender) return 'Gender is required';
    if (!subData.mobile.trim()) return 'Mobile Number is required';
    if (!/^\d{10}$/.test(subData.mobile.replace(/\D/g, ''))) return 'Please enter a valid 10-digit mobile number';

    if (!subData.college.trim()) return 'College Name selection is required';
    if (!subData.degree.trim()) return 'Degree selection is required';
    if (!subData.branch.trim()) return 'Branch/Specialization selection is required';
    if (!subData.currentYear) return 'Current Year of Study is required';
    if (!subData.graduationYear.trim()) return 'Graduation Year is required';
    if (!/^\d{4}$/.test(subData.graduationYear.trim())) return 'Please enter a valid 4-digit graduation year';
    if (!subData.cgpa.trim()) return 'Current CGPA is required';
    const cgpaNum = parseFloat(subData.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) return 'CGPA must be a decimal number between 0.0 and 10.0';

    if (!subData.city.trim()) return 'City is required';
    if (!subData.state.trim()) return 'State is required';
    if (!subData.country.trim()) return 'Country is required';

    if (!formData.isInfoAccurate) return 'You must confirm that the information provided is accurate';
    if (!formData.isTermsAccepted) return 'You must agree to the terms and conditions';

    return '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const submissionData = getSubmissionData(false);
    const res = await updateProfile(submissionData);

    if (res.success) {
      setLocalSuccess('Profile progress saved successfully!');
      setTimeout(() => setLocalSuccess(''), 3000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLocalError(res.msg || 'Failed to save profile. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const submissionData = getSubmissionData(true);
    const errorMsg = validateForm(submissionData);
    if (errorMsg) {
      setLocalError(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const res = await updateProfile(submissionData);
    if (!res.success) {
      setLocalError(res.msg || 'Something went wrong updating your profile. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }} className="animate-fade">
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '6px', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent' }}>
          Candidate Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Complete the collegiate details below to initialize your Hexaware eligibility assessment.
        </p>
      </div>

      {/* Completeness Tracker Card */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            background: completeness === 100 ? 'var(--success)' : 'rgba(99, 102, 241, 0.1)', 
            color: completeness === 100 ? 'white' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' 
          }}>
            {completeness}%
          </div>
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>PROFILE COMPLETENESS</span>
            <span style={{ color: completeness === 100 ? 'var(--success)' : 'var(--primary)' }}>
              {completeness === 100 ? 'Ready to Submit' : 'Required Fields Remaining'}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${completeness}%`, height: '100%', background: completeness === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%)', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
          </div>
        </div>
      </div>

      {localError && (
        <div className="error-alert" style={{ marginBottom: '32px' }}>
          <ShieldAlert size={18} />
          <span>{localError}</span>
        </div>
      )}

      {localSuccess && (
        <div className="success-alert" style={{ marginBottom: '32px' }}>
          <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          <span>{localSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', borderLeft: '3px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            <span>Personal Information</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full legal name"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                  style={{ paddingLeft: '40px', opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0,0,0,0.4)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '4px' }}>
            <div className="form-group">
              <label htmlFor="dob">Date of Birth *</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px', colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  className="form-control"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC HISTORY */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', borderLeft: '3px solid var(--accent-cyan)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <GraduationCap size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>Academic History</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <SearchableSelect
              label="College Name *"
              id="college"
              value={formData.college}
              onChange={(val) => setFormData(prev => ({ ...prev, college: val }))}
              options={tneaColleges}
              placeholder="Search TNEA code or name..."
              icon={School}
            />

            <div className="form-group">
              <label htmlFor="degree">Degree *</label>
              <select
                id="degree"
                name="degree"
                className="form-control"
                value={formData.degree}
                onChange={handleChange}
              >
                <option value="">Select Degree</option>
                {DEGREES.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
              {formData.degree === 'Other' && (
                <div style={{ marginTop: '10px' }} className="animate-fade">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter custom Degree"
                    value={customDegree}
                    onChange={(e) => setCustomDegree(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {formData.college === 'Other' && (
            <div style={{ marginTop: '-8px', marginBottom: '20px' }} className="animate-fade">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Custom College Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter custom College Name"
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '4px' }}>
            <div className="form-group">
              <label htmlFor="branch">Branch/Specialization *</label>
              <select
                id="branch"
                name="branch"
                className="form-control"
                value={formData.branch}
                onChange={handleChange}
              >
                <option value="">Select Specialization</option>
                {BRANCHES.map((b, i) => (
                  <option key={i} value={b}>{b}</option>
                ))}
              </select>
              {formData.branch === 'Other' && (
                <div style={{ marginTop: '10px' }} className="animate-fade">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter custom Specialization"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="currentYear">Current Year *</label>
              <select
                id="currentYear"
                name="currentYear"
                className="form-control"
                value={formData.currentYear}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '4px' }}>
            <div className="form-group">
              <label htmlFor="graduationYear">Graduation Year *</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="graduationYear"
                  name="graduationYear"
                  className="form-control"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cgpa">Current CGPA *</label>
              <div style={{ position: 'relative' }}>
                <Award size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="cgpa"
                  name="cgpa"
                  className="form-control"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.50"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', borderLeft: '3px solid var(--warning)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <MapPin size={20} style={{ color: 'var(--warning)' }} />
            <span>Location details</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Chennai"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Tamil Nadu"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="form-control"
                  value={formData.country}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: DECLARATIONS */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '32px', borderLeft: '3px solid var(--success)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <ShieldAlert size={20} style={{ color: 'var(--success)' }} />
            <span>Declarations</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Custom Checkbox Card 1 */}
            <div 
              onClick={() => handleChange({ target: { name: 'isInfoAccurate', type: 'checkbox', checked: !formData.isInfoAccurate }})}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                background: formData.isInfoAccurate ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                border: '1px solid',
                borderColor: formData.isInfoAccurate ? 'var(--success)' : 'rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '20px', height: '20px', borderRadius: '4px', border: '1.5px solid',
                borderColor: formData.isInfoAccurate ? 'var(--success)' : 'rgba(255,255,255,0.2)',
                background: formData.isInfoAccurate ? 'var(--success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                {formData.isInfoAccurate && <Check size={14} strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '0.925rem', color: formData.isInfoAccurate ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: formData.isInfoAccurate ? '500' : '400' }}>
                I confirm that the information provided is accurate. *
              </span>
            </div>

            {/* Custom Checkbox Card 2 */}
            <div 
              onClick={() => handleChange({ target: { name: 'isTermsAccepted', type: 'checkbox', checked: !formData.isTermsAccepted }})}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                background: formData.isTermsAccepted ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                border: '1px solid',
                borderColor: formData.isTermsAccepted ? 'var(--success)' : 'rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '20px', height: '20px', borderRadius: '4px', border: '1.5px solid',
                borderColor: formData.isTermsAccepted ? 'var(--success)' : 'rgba(255,255,255,0.2)',
                background: formData.isTermsAccepted ? 'var(--success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                {formData.isTermsAccepted && <Check size={14} strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '0.925rem', color: formData.isTermsAccepted ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: formData.isTermsAccepted ? '500' : '400' }}>
                I agree to the terms and conditions. *
              </span>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingBottom: '24px' }}>
          <button type="button" onClick={handleSave} className="secondary-btn" style={{ gap: '6px', padding: '12px 24px' }}>
            <Save size={16} />
            <span>Save Progress</span>
          </button>

          <button type="submit" className="glow-btn" style={{ padding: '12px 28px', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
            <span>Proceed to Eligibility Assessment</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileDetails;
