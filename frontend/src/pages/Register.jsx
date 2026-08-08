import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const body = JSON.stringify({ name, email, password });
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, body, config);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard'); // Will be created later
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-layout">
        
        {/* Left Side: Branding / Corporate */}
        <div className="auth-left">
          <div className="auth-left-content">
            <h1>Join MarketApp.</h1>
            <p>Deploy enterprise-grade marketing solutions for your organization and scale your operations globally.</p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Request Access</h2>
              <p>Create a new workspace account</p>
            </div>
            
            {error && <div className="alert-error"><span>⚠️</span> {error}</div>}
        
        <form onSubmit={onSubmit} autoComplete="off">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field with-icon" 
                name="name"
                value={name}
                onChange={onChange}
                required 
                placeholder="John Doe"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                className="input-field with-icon" 
                name="email"
                value={email}
                onChange={onChange}
                required 
                placeholder="you@company.com"
                autoComplete="off"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                className="input-field with-icon" 
                name="password"
                value={password}
                onChange={onChange}
                required 
                placeholder="••••••••"
                minLength="6"
                autoComplete="new-password"
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary auth-submit">
            <UserPlus size={20} />
            Register
          </button>
        </form>
        
            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
