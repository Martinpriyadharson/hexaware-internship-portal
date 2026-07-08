import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
    <div style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }} className="animate-fade">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', marginBottom: '16px' }}>
          {isRegister ? <UserPlus size={32} /> : <LogIn size={32} />}
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>
          {isRegister ? 'Join Hexaware' : 'Welcome Back'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isRegister ? 'Create an intern account to start eligibility test' : 'Sign in to access your internship portal'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
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
            style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Sign In Here' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
