import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';
import HexawareLogo from '../components/HexawareLogo';

const Auth = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
 
  const { register, login, error, setError } = useContext(AuthContext);
 
  useEffect(() => {
    setError(null);
  }, [isRegister]);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const sanitized = value.replace(/[^A-Za-z\s]/g, '');
      setFormData({
        ...formData,
        [name]: sanitized,
      });
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      await register(formData.name, formData.email, formData.password);
    } else {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      await login(formData.email, formData.password);
    }
  };
 
  return (
    <>
      <div style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }} className="animate-fade">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '8px', fontWeight: '800', color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {isRegister ? 'Join Hexaware' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: '500', fontSize: '1rem', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
            {isRegister ? 'Create an intern account to start eligibility test' : 'Sign in to access your internship portal'}
          </p>
        </div>
 
        <div className="glass-card" style={{ padding: '24px' }}>
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
 
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}
 
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="name@college.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
 
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
 
            <button type="submit" className="glow-btn" style={{ width: '100%', marginTop: '10px' }}>
              <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
 
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegister ? 'Sign In Here' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
