import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Shield, TrendingUp, BarChart3, ShieldCheck, Sparkles, Layers } from 'lucide-react';
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
      <div className="auth-split-layout">
        
        {/* Left Side: Enterprise Branding & Live Marketing Analytics Graphic */}
        <div className="auth-left">
          <div className="auth-brand-badge">
            <div className="brand-logo-icon">∞</div>
            <span className="brand-name">Shree</span>
            <span className="brand-pill">Enterprise Platform</span>
          </div>

          <div className="auth-left-content">
            <h1>Grow Your Marketing.<br /><span className="text-gradient">Scale Your Business.</span></h1>
            <p>Plan campaigns, manage leads, track performance, and grow your business from one powerful marketing platform.</p>
          </div>

          {/* Interactive Graphic Showcase Widgets */}
          <div className="auth-graphic-showcase">
            <div className="showcase-card showcase-card-main">
              <div className="showcase-card-header">
                <div className="showcase-icon-badge">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <div className="showcase-title">Campaign Growth</div>
                  <div className="showcase-sub">Real-time Performance</div>
                </div>
                <div className="showcase-tag">+28.4%</div>
              </div>
              <div className="showcase-bars">
                <div className="bar" style={{ height: '40%' }}></div>
                <div className="bar" style={{ height: '65%' }}></div>
                <div className="bar" style={{ height: '50%' }}></div>
                <div className="bar" style={{ height: '85%' }}></div>
                <div className="bar bar-active" style={{ height: '100%' }}></div>
              </div>
            </div>

            <div className="showcase-floating-grid">
              <div className="showcase-mini-card">
                <TrendingUp size={16} className="text-success" />
                <div>
                  <div className="mini-val">1,480</div>
                  <div className="mini-lbl">Qualified Leads</div>
                </div>
              </div>

              <div className="showcase-mini-card">
                <ShieldCheck size={16} className="text-primary" />
                <div>
                  <div className="mini-val">99.9%</div>
                  <div className="mini-lbl">Enterprise SLA</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-left-footer">
            <div className="trust-badges">
              <span><Sparkles size={14} /> Multi-Channel Automation</span>
              <span><Layers size={14} /> Unified Lead Pipeline</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="auth-right">
          <div className="auth-card">
            
            {/* Mobile Branding Header */}
            <div className="mobile-auth-brand">
              <div className="brand-logo-icon">∞</div>
              <h2>Shree</h2>
            </div>

            <div className="auth-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue to your marketing workspace.</p>
            </div>
            
            {error && (
              <div className="alert-error" role="alert">
                <span className="error-icon">⚠️</span>
                <div>
                  <strong className="error-title">Unable to sign in</strong>
                  <p className="error-desc">{error}</p>
                </div>
              </div>
            )}
        
            <form onSubmit={onSubmit} autoComplete="on">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input 
                    id="email"
                    type="email" 
                    className="input-field with-icon" 
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
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                </div>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    className="input-field with-icon with-action" 
                    name="password"
                    value={password}
                    onChange={onChange}
                    required 
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
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
                <div className="input-icon-wrapper">
                  <Shield className="input-icon" size={18} />
                  <select
                    id="role"
                    className="input-field with-icon select-field"
                    name="role"
                    value={role}
                    onChange={onChange}
                    required
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register" className="auth-link">Request Access</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
