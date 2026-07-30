import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  User, BookOpen, MapPin, ShieldAlert, ArrowRight, 
  Save, GraduationCap, CheckCircle2, Info, Mail, Phone, Calendar, Clock,
  Globe, Landmark, School, Award, Check, UploadCloud, FileText, Eye, Download
} from 'lucide-react';
import tneaColleges from '../data/tneaColleges.json';
import Galaxy from '../components/Galaxy';
import { openResumeInNewTab, downloadResumeFile, getResumeFileName } from '../utils/resumeHelper';

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

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
  'Other'
];

const CITIES_BY_STATE = {
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem', 
    'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi (Tuticorin)', 'Nagercoil', 
    'Thanjavur', 'Kanchipuram', 'Dindigul', 'Karur', 'Tiruppur', 'Cuddalore', 
    'Neyveli', 'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 
    'Gudiyatham', 'Pudukkottai', 'Vaniyambadi', 'Ambur', 'Nagapattinam', 
    'Karaikudi', 'Tenkasi', 'Mayiladuthurai', 'Dharmapuri', 'Krishnagiri', 
    'Namakkal', 'Ranipet', 'Sivakasi', 'Theni', 'Tirupathur', 'Tiruvallur', 
    'Tiruvarur', 'Ooty (Udhagamandalam)', 'Ariyalur', 'Perambalur', 
    'Kallakurichi', 'Ramanathapuram', 'Virudhunagar', 'Other'
  ],
  'Karnataka': ['Bangalore (Bengaluru)', 'Mysore (Mysuru)', 'Mangalore (Mangaluru)', 'Hubli-Dharwad', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Shimoga', 'Tumkur', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Kadapa', 'Anantapur', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam', 'Mahbubnagar', 'Other'],
  'Kerala': ['Kochi', 'Thiruvananthapuram (Trivandrum)', 'Kozhikode (Calicut)', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kottayam', 'Kannur', 'Other'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Other'],
  'Delhi': ['New Delhi', 'Delhi NCR', 'Dwarka', 'Rohini', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Prayagraj (Allahabad)', 'Bareilly', 'Aligarh', 'Noida', 'Other'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol', 'Durgapur', 'Bardhaman', 'Kharagpur', 'Other'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Other'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Other'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Other'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Other'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Other'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Other'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee', 'Other'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Other'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Other'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Other'],
  'Chandigarh': ['Chandigarh', 'Other'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Other']
};

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
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          resumeUrl: reader.result,
          resumeName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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
  const [customState, setCustomState] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customCountry, setCustomCountry] = useState('');

  // Pre-fill user data when context is loaded
  useEffect(() => {
    if (user) {
      const dbCollege = user.college || '';
      const rawDegree = user.degree || '';
      const rawBranch = user.branch || '';
      const rawYear = user.currentYear || '';
      const dbState = user.state || '';
      const dbCity = user.city || '';
      const dbCountry = user.country || 'India';

      // Normalize Degree option matching
      let dbDegree = rawDegree;
      const degUpper = rawDegree.toUpperCase();
      if (degUpper.includes('B.E') || degUpper.includes('BE')) dbDegree = 'B.E';
      else if (degUpper.includes('B.TECH') || degUpper.includes('BTECH')) dbDegree = 'B.Tech';
      else if (degUpper.includes('M.TECH') || degUpper.includes('MTECH')) dbDegree = 'M.Tech';
      else if (degUpper.includes('M.E') || degUpper.includes('ME')) dbDegree = 'M.E';
      else if (degUpper.includes('B.SC') || degUpper.includes('BSC')) dbDegree = 'B.Sc';
      else if (degUpper.includes('M.SC') || degUpper.includes('MSC')) dbDegree = 'M.Sc';
      else if (degUpper.includes('MCA')) dbDegree = 'MCA';
      else if (degUpper.includes('BCA')) dbDegree = 'BCA';

      // Normalize Branch option matching
      const actualRawBranch = user.branch || user.department || user.specialization || user.branchName || '';
      let dbBranch = actualRawBranch;
      if (actualRawBranch) {
        const brUpper = String(actualRawBranch).toUpperCase();
        if (brUpper.includes('COMP') || brUpper.includes('CSE') || brUpper.includes('SCIENCE')) {
          dbBranch = 'Computer Science & Engineering';
        } else if (brUpper.includes('INFO') || brUpper.includes('IT')) {
          dbBranch = 'Information Technology';
        } else if (brUpper.includes('ARTIFICIAL') || brUpper.includes('AI') || brUpper.includes('DATA')) {
          dbBranch = 'Artificial Intelligence & Data Science';
        } else if (brUpper.includes('ELECTRONICS') || brUpper.includes('ECE') || brUpper.includes('COMMUNICATION')) {
          dbBranch = 'Electronics & Communication';
        } else if (brUpper.includes('ELECTRICAL') || brUpper.includes('EEE')) {
          dbBranch = 'Electrical & Electronics';
        } else if (brUpper.includes('MECH')) {
          dbBranch = 'Mechanical Engineering';
        } else if (brUpper.includes('CIVIL')) {
          dbBranch = 'Civil Engineering';
        } else if (brUpper.includes('CYBER') || brUpper.includes('SECURITY')) {
          dbBranch = 'Cyber Security';
        }
      }

      // Normalize Current Year option matching
      let dbYear = rawYear;
      const yrUpper = String(rawYear).toUpperCase();
      if (yrUpper.includes('4') || yrUpper.includes('FINAL')) dbYear = 'Final Year (4th Year)';
      else if (yrUpper.includes('3') || yrUpper.includes('PRE')) dbYear = 'Pre-Final Year (3rd Year)';
      else if (yrUpper.includes('2')) dbYear = '2nd Year';
      else if (yrUpper.includes('1')) dbYear = '1st Year';

      const isCollegeInList = tneaColleges.includes(dbCollege);
      const isStateInList = INDIAN_STATES.includes(dbState);
      const isCountryInList = ['India'].includes(dbCountry);
      
      let isCityInList = false;
      if (isStateInList && CITIES_BY_STATE[dbState]) {
        isCityInList = CITIES_BY_STATE[dbState].includes(dbCity);
      }

      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        dob: user.dob || '',
        gender: user.gender || '',
        mobile: user.mobile || '',
        college: dbCollege ? (isCollegeInList ? dbCollege : 'Other') : '',
        degree: dbDegree,
        branch: dbBranch,
        currentYear: dbYear,
        graduationYear: user.graduationYear || '',
        cgpa: user.cgpa || '',
        resumeUrl: user.resumeUrl || '',
        resumeName: user.resumeName || '',
        city: dbCity ? (isCityInList ? dbCity : 'Other') : '',
        state: dbState ? (isStateInList ? dbState : 'Other') : '',
        country: dbCountry ? (isCountryInList ? dbCountry : 'Other') : 'India',
        isInfoAccurate: Boolean(user.isDeclarationConfirmed || user.isProfileCompleted || user.hasAttemptedAssessment),
        isTermsAccepted: Boolean(user.isDeclarationConfirmed || user.isProfileCompleted || user.hasAttemptedAssessment),
      }));

      if (dbCollege && !isCollegeInList) setCustomCollege(dbCollege);
      if (dbState && !isStateInList) setCustomState(dbState);
      if (dbCity && !isCityInList) setCustomCity(dbCity);
      if (dbCountry && !isCountryInList) setCustomCountry(dbCountry);
    }
  }, [user]);

  // Dynamically calculate profile completeness percentage
  useEffect(() => {
    // If candidate has already completed setup, declaration, or assessment, profile is 100% complete
    if (user?.isProfileCompleted || user?.isDeclarationConfirmed || user?.hasAttemptedAssessment || user?.assignedMentorId) {
      setCompleteness(100);
      return;
    }

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
      } else if (val && String(val).trim() !== '') {
        if (field === 'college' && val === 'Other') {
          if ((customCollege && customCollege.trim() !== '') || (user?.college && user?.college !== 'Other')) filledCount++;
        } else if (field === 'degree' && val === 'Other') {
          if ((customDegree && customDegree.trim() !== '') || (user?.degree && user?.degree !== 'Other')) filledCount++;
        } else if (field === 'branch' && val === 'Other') {
          if ((customBranch && customBranch.trim() !== '') || (user?.branch && user?.branch !== 'Other')) filledCount++;
        } else {
          filledCount++;
        }
      }
    });

    const percent = Math.round((filledCount / fieldsToTrack.length) * 100);
    setCompleteness(percent);
  }, [formData, customCollege, customDegree, customBranch, user]);

  const getCurrentYearOptions = (deg) => {
    if (!deg) {
      return ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year (4th Year)', 'Other'];
    }
    
    // Master degrees (M.E., M.Tech, M.C.A., M.Sc, etc.)
    if (deg.startsWith('M.')) {
      return ['1st Year', '2nd Year', 'Other'];
    }
    
    // 3-year Bachelor degrees (B.Sc, B.C.A)
    if (deg.startsWith('B.Sc') || deg.startsWith('B.C.A')) {
      return ['1st Year', '2nd Year', '3rd Year', 'Other'];
    }
    
    // Default/4-year Bachelor degrees (B.E., B.Tech)
    return ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year (4th Year)', 'Other'];
  };

  const getBranchOptions = (deg) => {
    if (!deg) {
      return BRANCHES;
    }
    
    // B.Sc or M.Sc specializations
    if (deg.includes('B.Sc') || deg.includes('M.Sc')) {
      return [
        'Computer Science',
        'Information Technology',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Other'
      ];
    }
    
    // B.C.A or M.C.A specializations
    if (deg.includes('B.C.A') || deg.includes('M.C.A')) {
      return [
        'Computer Applications',
        'Computer Science',
        'Other'
      ];
    }
    
    // Default engineering branches (B.E., B.Tech, M.E., M.Tech)
    return BRANCHES;
  };

  // Reset branch and currentYear if they are no longer valid for the selected degree
  useEffect(() => {
    const deg = formData.degree === 'Other' ? customDegree : formData.degree;
    
    // Sync currentYear
    const yearOptions = getCurrentYearOptions(deg);
    if (formData.currentYear && !yearOptions.includes(formData.currentYear)) {
      setFormData(prev => ({ ...prev, currentYear: '' }));
    }
    
    // Sync branch
    const branchOptions = getBranchOptions(deg);
    if (formData.branch && !branchOptions.includes(formData.branch)) {
      setFormData(prev => ({ ...prev, branch: '' }));
    }
  }, [formData.degree, customDegree]);

  // Reset City if State changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, city: '' }));
    setCustomCity('');
  }, [formData.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'name') {
      // Allow only letters and spaces
      const sanitized = value.replace(/[^A-Za-z\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
      return;
    }

    if (name === 'mobile') {
      // Allow only numbers and limit to 10 digits
      const sanitized = value.replace(/\D/g, '').substring(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
      return;
    }

    if (name === 'graduationYear') {
      // Allow only numbers and limit to 4 digits
      const sanitized = value.replace(/\D/g, '').substring(0, 4);
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getSubmissionData = (isFinalSubmit = false) => {
    const isAlreadyCompleted = Boolean(user?.isProfileCompleted || user?.hasAttemptedAssessment || user?.assignedMentorId);
    return {
      name: formData.name,
      college: formData.college === 'Other' ? customCollege : formData.college,
      degree: formData.degree === 'Other' ? customDegree : formData.degree,
      branch: formData.branch === 'Other' ? customBranch : formData.branch,
      currentYear: formData.currentYear,
      graduationYear: formData.graduationYear,
      cgpa: formData.cgpa,
      resumeUrl: formData.resumeUrl,
      dob: formData.dob,
      gender: formData.gender,
      mobile: formData.mobile,
      city: formData.city === 'Other' ? customCity : formData.city,
      state: formData.state === 'Other' ? customState : formData.state,
      country: formData.country === 'Other' ? customCountry : formData.country,
      internshipDuration: formData.internshipDuration || '3 Months',
      isDeclarationConfirmed: (isFinalSubmit || isAlreadyCompleted) ? true : (formData.isInfoAccurate && formData.isTermsAccepted),
      isProfileCompleted: (isFinalSubmit || isAlreadyCompleted) ? true : false
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
    if (res.success) {
      const isAlreadyCompleted = Boolean(user?.isProfileCompleted || user?.hasAttemptedAssessment || user?.assignedMentorId);
      setLocalSuccess(isAlreadyCompleted ? 'Profile details updated successfully!' : 'Profile setup completed! Loading assessment...');
      setTimeout(() => setLocalSuccess(''), 3500);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLocalError(res.msg || 'Something went wrong updating your profile. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>

      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }} className="animate-fade">
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '6px', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Candidate Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          {(user?.isProfileCompleted || user?.hasAttemptedAssessment || user?.assignedMentorId) 
            ? 'View and update your collegiate credentials, contact information, and academic records.' 
            : 'Complete the collegiate details below to initialize your Hexaware eligibility assessment.'}
        </p>
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

          <div className="responsive-grid grid-2">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="name" style={{ margin: 0 }}>Full Name *</label>
                <span style={{ fontSize: '0.725rem', color: '#10b981', fontWeight: '600' }}>Pre-filled from Signup</span>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="email" style={{ margin: 0 }}>Email Address *</label>
                <span style={{ fontSize: '0.725rem', color: '#818cf8', fontWeight: '600' }}>Verified Account</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                  style={{ paddingLeft: '40px', opacity: 0.7, cursor: 'not-allowed', background: 'rgba(0,0,0,0.4)' }}
                />
              </div>
            </div>
          </div>

          <div className="responsive-grid grid-3" style={{ marginTop: '4px' }}>
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

            <div className="form-group">
              <label htmlFor="internshipDuration">Internship Duration / Period *</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  id="internshipDuration"
                  name="internshipDuration"
                  className="form-control"
                  value={formData.internshipDuration}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="6 Weeks">6 Weeks</option>
                  <option value="1 Year">1 Year</option>
                </select>
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

          <div className="responsive-grid grid-2">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <SearchableSelect
                label="College Name *"
                id="college"
                value={formData.college}
                onChange={(val) => setFormData(prev => ({ ...prev, college: val }))}
                options={tneaColleges}
                placeholder="Search or select your college name..."
                icon={School}
              />
              {formData.college === 'Other' && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your full college name..."
                    value={customCollege}
                    onChange={(e) => {
                      setCustomCollege(e.target.value);
                    }}
                  />
                </div>
              )}
            </div>

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
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="B.E">B.E (Bachelor of Engineering)</option>
                <option value="M.Tech">M.Tech (Master of Technology)</option>
                <option value="M.E">M.E (Master of Engineering)</option>
                <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                <option value="M.Sc">M.Sc (Master of Science)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
                <option value="BCA">BCA (Bachelor of Computer Applications)</option>
              </select>
            </div>
          </div>

          <div className="responsive-grid grid-2" style={{ marginTop: '16px' }}>
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
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
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
                <option value="Final Year (4th Year)">Final Year (4th Year)</option>
                <option value="Pre-Final Year (3rd Year)">Pre-Final Year (3rd Year)</option>
                <option value="2nd Year">2nd Year</option>
                <option value="1st Year">1st Year</option>
              </select>
            </div>
          </div>

          <div className="responsive-grid grid-2" style={{ marginTop: '16px' }}>
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

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="resumeFile" style={{ fontWeight: '600', color: '#f8fafc', marginBottom: '8px', display: 'block' }}>
              Upload & Attach Resume / CV Document (PDF, DOC, DOCX) *
            </label>
            
            <div 
              style={{
                border: '2px dashed rgba(99, 102, 241, 0.4)',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(99, 102, 241, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.7)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)';
              }}
            >
              <input 
                type="file" 
                id="resumeFile" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', zIndex: 10
                }}
              />

              {formData.resumeUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{fileName || formData.resumeName || user?.resumeName || getResumeFileName(user)}</span>
                        <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '2px' }}>
                        File attached successfully! Click or drag to replace document.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', zIndex: 20, position: 'relative', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openResumeInNewTab(formData.resumeUrl, fileName || formData.resumeName || getResumeFileName(user));
                      }}
                      className="secondary-btn"
                      style={{
                        padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.15)',
                        borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} /> View Resume
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadResumeFile(formData.resumeUrl, `${formData.name || user?.name || 'Candidate'}_Resume.pdf`);
                      }}
                      className="glow-btn"
                      style={{
                        padding: '6px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                      }}
                    >
                      <Download size={14} /> Download Resume
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.12)',
                    border: '1px solid rgba(129, 140, 248, 0.3)', color: '#818cf8', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto'
                  }}>
                    <UploadCloud size={26} />
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.95rem' }}>
                    Click or drag & drop to attach your Resume file
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                    Supported formats: PDF, DOC, DOCX (Max size: 10MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Academic & Placement Fields */}
          <div className="responsive-grid grid-2" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label htmlFor="activeBacklogs">Active Backlogs / Arrears</label>
              <select
                id="activeBacklogs"
                name="activeBacklogs"
                className="form-control"
                value={formData.activeBacklogs || '0'}
                onChange={handleChange}
              >
                <option value="0">0 (No Active Backlogs)</option>
                <option value="1">1 Active Backlog</option>
                <option value="2+">2+ Active Backlogs</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferredLocation">Preferred Hexaware Work Location</label>
              <select
                id="preferredLocation"
                name="preferredLocation"
                className="form-control"
                value={formData.preferredLocation || 'Chennai'}
                onChange={handleChange}
              >
                <option value="Chennai">Chennai (Siruseri / SIPCOT Campus)</option>
                <option value="Bengaluru">Bengaluru (Electronic City)</option>
                <option value="Hyderabad">Hyderabad (Hitech City)</option>
                <option value="Pune">Pune (Hinjawadi)</option>
                <option value="Mumbai">Mumbai (Navi Mumbai)</option>
                <option value="Noida">Noida (Delhi NCR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', borderLeft: '3px solid var(--warning)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <MapPin size={20} style={{ color: 'var(--warning)' }} />
            <span>Location details</span>
          </h3>

          <div className="responsive-grid grid-3">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              {formData.country === 'India' && CITIES_BY_STATE[formData.state] ? (
                <select
                  id="city"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                >
                  <option value="">Select City</option>
                  {CITIES_BY_STATE[formData.state].map((ct, i) => (
                    <option key={i} value={ct}>{ct}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-control"
                  value={formData.city === 'Other' ? customCity : formData.city}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, city: val }));
                  }}
                  placeholder="e.g. Chennai"
                />
              )}
              {formData.country === 'India' && CITIES_BY_STATE[formData.state] && formData.city === 'Other' && (
                <div style={{ marginTop: '10px' }} className="animate-fade">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter custom City"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="state">State *</label>
              {formData.country === 'India' ? (
                <select
                  id="state"
                  name="state"
                  className="form-control"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="form-control"
                  value={formData.state === 'Other' ? customState : formData.state}
                  onChange={handleChange}
                  placeholder="Enter State"
                />
              )}
              {formData.country === 'India' && formData.state === 'Other' && (
                <div style={{ marginTop: '10px' }} className="animate-fade">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter custom State"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  id="country"
                  name="country"
                  className="form-control"
                  value={formData.country}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {formData.country === 'Other' && (
                <div style={{ marginTop: '10px' }} className="animate-fade">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter custom Country"
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: CANDIDATE PORTFOLIO & WORK PREFERENCES (Only for completed profiles) */}
        {user?.isProfileCompleted && (
          <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', borderLeft: '3px solid #818cf8' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Award size={20} style={{ color: '#818cf8' }} />
              <span>Technical Portfolio & Work Preferences</span>
            </h3>

            <div className="responsive-grid grid-2">
              <div className="form-group">
                <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    className="form-control"
                    value={formData.linkedinUrl || ''}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/your-profile"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="githubUrl">GitHub / Portfolio URL</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    className="form-control"
                    value={formData.githubUrl || ''}
                    onChange={handleChange}
                    placeholder="https://github.com/your-username"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>

            <div className="responsive-grid grid-2" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label htmlFor="skills">Primary Technical Skills</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="form-control"
                  value={formData.skills || ''}
                  onChange={handleChange}
                  placeholder="e.g. Java, Python, React, SQL, Git"
                />
              </div>

              <div className="form-group">
                <label htmlFor="certifications">Certifications & Achievements (or Nil)</label>
                <input
                  type="text"
                  id="certifications"
                  name="certifications"
                  className="form-control"
                  value={formData.certifications || ''}
                  onChange={handleChange}
                  placeholder="e.g. AWS Certified, Oracle Java SE (or Nil)"
                />
              </div>
            </div>
          </div>
        )}

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
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave(e);
            }} 
            className="secondary-btn" 
            style={{ gap: '6px', padding: '12px 24px' }}
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>

          {(user?.isProfileCompleted || user?.hasAttemptedAssessment || user?.assignedMentorId) ? (
            <button type="submit" className="glow-btn" style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>Save Profile Changes</span>
            </button>
          ) : (
            <button type="submit" className="glow-btn" style={{ padding: '12px 28px', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Proceed to Eligibility Assessment</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
    </>
  );
};

export default ProfileDetails;
