import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Shield, ArrowRight, TrendingUp, BarChart2, Megaphone, Target, Share2, Sparkles, MessageCircle } from 'lucide-react';
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
    <div className="mkt-auth-page">
      {/* Soft Marketing Mesh Gradient & Abstract Shapes */}
      <div className="mkt-mesh-blob blob-purple"></div>
      <div className="mkt-mesh-blob blob-blue"></div>
      <div className="mkt-mesh-blob blob-pink"></div>

      <div className="mkt-auth-container">
        
        {/* LEFT / MAIN MARKETING HERO SECTION (~55-60%) */}
        <div className="mkt-hero-section">
          {/* Top Brand Header */}
          <div className="mkt-brand-header">
            <div className="mkt-brand-logo">∞</div>
            <div>
              <div className="mkt-brand-name">Mekka</div>
              <div className="mkt-brand-tagline">Digital Marketing Platform</div>
            </div>
          </div>

          {/* Hero Copy */}
          <div className="mkt-hero-copy">
            <h1 className="mkt-hero-title">
              Turn Ideas Into <br />
              <span className="mkt-text-gradient">Digital Growth.</span>
            </h1>
            <p className="mkt-hero-description">
              Plan campaigns, connect with customers, generate leads, and measure your marketing performance — all from one powerful platform.
            </p>

            {/* 3 Marketing Feature Badges */}
            <div className="mkt-feature-badges">
              <div className="mkt-badge">
                <Megaphone size={15} className="badge-icon-purple" />
                <span>Campaigns</span>
              </div>
              <div className="mkt-badge">
                <TrendingUp size={15} className="badge-icon-pink" />
                <span>Growth</span>
              </div>
              <div className="mkt-badge">
                <BarChart2 size={15} className="badge-icon-blue" />
                <span>Analytics</span>
              </div>
            </div>
          </div>

          {/* Abstract Marketing Analytics UI Illustration (Decorative Only) */}
          <div className="mkt-hero-visual">
            <div className="mkt-visual-card mkt-card-main">
              <div className="mkt-card-top">
                <div className="mkt-card-badge">
                  <Sparkles size={14} /> Campaign Engagement
                </div>
                <div className="mkt-card-channels">
                  <div className="channel-dot dot-email" title="Email"><Mail size={12} /></div>
                  <div className="channel-dot dot-social" title="Social"><Share2 size={12} /></div>
                  <div className="channel-dot dot-chat" title="WhatsApp/SMS"><MessageCircle size={12} /></div>
                </div>
              </div>

              {/* Decorative Curve Line Graph */}
              <div className="mkt-graph-wrapper">
                <svg viewBox="0 0 400 120" className="mkt-svg-graph">
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 100 Q 80 40, 160 70 T 320 20 L 400 35 L 400 120 L 0 120 Z" fill="url(#curveGradient)" />
                  <path d="M 0 100 Q 80 40, 160 70 T 320 20 L 400 35" fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="320" cy="20" r="6" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Floating Mini Decorative Cards */}
            <div className="mkt-floating-cards">
              <div className="mkt-mini-pill pill-lead">
                <Target size={15} />
                <span>Lead Pipeline Active</span>
              </div>
              <div className="mkt-mini-pill pill-growth">
                <TrendingUp size={15} />
                <span>High Engagement</span>
              </div>
            </div>
          </div>
        </div>


        {/* RIGHT LOGIN AREA (~40-45%) */}
        <div className="mkt-auth-form-wrapper">
          
          {/* Mobile Header Banner */}
          <div className="mkt-mobile-brand">
            <div className="mkt-brand-logo">∞</div>
            <div>
              <div className="mkt-brand-name">Mekka</div>
              <div className="mkt-brand-tagline">Digital Marketing Platform</div>
            </div>
          </div>

          <div className="mkt-login-card">
            
            <div className="mkt-card-header">
              <h2>Welcome back 👋</h2>
              <p>Sign in to manage your marketing workspace.</p>
            </div>
            
            {error && (
              <div className="mkt-alert-error" role="alert">
                <span className="mkt-error-icon">⚠️</span>
                <div className="mkt-error-body">
                  <strong>Unable to sign in</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}
        
            <form onSubmit={onSubmit} autoComplete="on" className="mkt-form">
              
              <div className="mkt-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="mkt-input-wrapper">
                  <Mail className="mkt-input-icon" size={18} />
                  <input 
                    id="email"
                    type="email" 
                    className="mkt-input with-icon" 
                    name="email"
                    value={email}
                    onChange={onChange}
                    required 
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="mkt-form-group">
                <label htmlFor="password">Password</label>
                <div className="mkt-input-wrapper">
                  <Lock className="mkt-input-icon" size={18} />
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    className="mkt-input with-icon with-action" 
                    name="password"
                    value={password}
                    onChange={onChange}
                    required 
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="mkt-pwd-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mkt-form-group">
                <label htmlFor="role">Role</label>
                <div className="mkt-input-wrapper">
                  <Shield className="mkt-input-icon" size={18} />
                  <select
                    id="role"
                    className="mkt-input with-icon mkt-select"
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
                className="mkt-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="mkt-spinner"></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            
            <div className="mkt-card-footer">
              <p>Don't have an account? <Link to="/register" className="mkt-link">Request Access</Link></p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
