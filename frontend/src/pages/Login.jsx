import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Shield, ArrowRight, CheckCircle2, Zap, BarChart2, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Viewer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password, role } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const body = JSON.stringify({ email, password, role });
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, body, config);
      localStorage.setItem('token', res.data.token);
      
      // Update global auth state immediately
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { 'x-auth-token': res.data.token }
      });
      setUser(userRes.data);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Ambient Glow Orbs & Subtle Grid */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="bg-grid-pattern"></div>

      <div className="auth-wrapper">
        
        {/* Left Side: Modern SaaS Marketing Content */}
        <div className="auth-left-section">
          {/* Top Brand Header */}
          <div className="brand-header">
            <div className="brand-icon">∞</div>
            <div>
              <div className="brand-title">Mekka</div>
              <div className="brand-subtitle">Marketing • Analytics • Growth</div>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="hero-headline">
              Turn Your Marketing<br />
              <span className="hero-gradient-text">Into Measurable Growth.</span>
            </h1>
            <p className="hero-description">
              Plan campaigns, manage leads, track performance, and grow your business from one powerful marketing platform.
            </p>

            {/* Feature Highlights */}
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <Zap size={16} />
                </div>
                <span>Campaign Management</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <BarChart2 size={16} />
                </div>
                <span>Lead Analytics</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <TrendingUp size={16} />
                </div>
                <span>Marketing Performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="auth-right-section">
          <div className="glass-login-card">
            
            {/* Mobile Top Brand */}
            <div className="mobile-brand">
              <div className="brand-icon">∞</div>
              <div>
                <div className="brand-title">Mekka</div>
                <div className="brand-subtitle">Marketing Platform</div>
              </div>
            </div>

            <div className="card-header">
              <div className="card-logo-badge">
                <span className="badge-icon">∞</span>
              </div>
              <h2>Welcome back</h2>
              <p>Sign in to continue to your workspace.</p>
            </div>
            
            {error && (
              <div className="auth-alert-error" role="alert">
                <span className="alert-icon">⚠️</span>
                <div className="alert-content">
                  <strong className="alert-title">Unable to sign in</strong>
                  <p className="alert-text">{error}</p>
                </div>
              </div>
            )}
        
            <form onSubmit={onSubmit} autoComplete="on" className="login-form">
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-container">
                  <Mail className="field-icon" size={18} />
                  <input 
                    id="email"
                    type="email" 
                    className="saas-input with-icon" 
                    name="email"
                    value={email}
                    onChange={onChange}
                    required 
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <Lock className="field-icon" size={18} />
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    className="saas-input with-icon with-action" 
                    name="password"
                    value={password}
                    onChange={onChange}
                    required 
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <div className="input-container">
                  <Shield className="field-icon" size={18} />
                  <select
                    id="role"
                    className="saas-input with-icon saas-select"
                    name="role"
                    value={role}
                    onChange={onChange}
                    required
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="gradient-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="submit-spinner"></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            
            <div className="card-footer">
              <p>Don't have an account? <Link to="/register" className="register-link">Request Access</Link></p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
