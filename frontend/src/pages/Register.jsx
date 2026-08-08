import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX / window.innerWidth - 0.5) * 15;
    const moveY = (clientY / window.innerHeight - 0.5) * 15;
    setMousePos({ x: moveX, y: moveY });
  };

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
      const body = JSON.stringify({ name, email, password });
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, body, config);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't create account. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mekka-page-canvas" onMouseMove={handleMouseMove}>
      
      {/* Top Editorial Bar */}
      <header className="mekka-top-bar">
        <div className="mekka-brand-lockup">
          <div className="mekka-signature-mark">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#6D5DF5" />
            </svg>
          </div>
          <span className="mekka-brand-name">Shree</span>
          <span className="mekka-brand-divider">/</span>
          <span className="mekka-brand-tagline">Where marketing moves.</span>
        </div>

        <div className="mekka-top-actions">
          <Link to="/login" className="mekka-secondary-link">Sign in</Link>
        </div>
      </header>

      {/* Main Full-Screen Composition */}
      <main className="mekka-main-composition">
        
        {/* Left Editorial Section & Signature Marketing Orbit Visual */}
        <div className="mekka-editorial-section">
          
          <div className="mekka-editorial-header">
            <h1 className="mekka-headline">
              Build your reach,<br />
              <span className="mekka-headline-accent">scale your growth.</span>
            </h1>
            <p className="mekka-subhead">
              Create a new Shree workspace to orchestrate multi-channel marketing, manage leads, and measure performance.
            </p>
          </div>

          {/* Signature "Marketing Orbit" Decorative SVG Illustration */}
          <div 
            className="mekka-orbit-container"
            style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0px)` }}
          >
            <svg viewBox="0 0 500 360" className="mekka-orbit-svg">
              <defs>
                <linearGradient id="orbitLineGradReg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6D5DF5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF7E67" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Orbital Rings */}
              <circle cx="250" cy="180" r="140" stroke="#E5E3DC" strokeWidth="1" strokeDasharray="4 6" fill="none" />
              <circle cx="250" cy="180" r="85" stroke="#EEDDFD" strokeWidth="1" fill="none" />

              {/* Connected Lines to Orbit Nodes */}
              <line x1="250" y1="180" x2="150" y2="90" stroke="url(#orbitLineGradReg)" strokeWidth="1.5" />
              <line x1="250" y1="180" x2="350" y2="90" stroke="url(#orbitLineGradReg)" strokeWidth="1.5" />
              <line x1="250" y1="180" x2="380" y2="200" stroke="url(#orbitLineGradReg)" strokeWidth="1.5" />
              <line x1="250" y1="180" x2="280" y2="300" stroke="url(#orbitLineGradReg)" strokeWidth="1.5" />
              <line x1="250" y1="180" x2="120" y2="240" stroke="url(#orbitLineGradReg)" strokeWidth="1.5" />

              {/* Central Shree Core Node */}
              <g transform="translate(250, 180)">
                <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#6D5DF5" strokeWidth="2" />
                <path d="M-6 -6 L1.25 -1.25 L6 -6 L1.25 1.25 L6 6 L-1.25 1.25 L-6 6 L-1.25 -1.25 Z" fill="#6D5DF5" transform="scale(1.2)" />
              </g>

              {/* Node 1: Campaigns */}
              <g transform="translate(150, 90)">
                <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#6D5DF5" strokeWidth="1.5" />
                <text x="0" y="32" textAnchor="middle" className="orbit-node-label">Campaigns</text>
              </g>

              {/* Node 2: Audience */}
              <g transform="translate(350, 90)">
                <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#FF7E67" strokeWidth="1.5" />
                <text x="0" y="30" textAnchor="middle" className="orbit-node-label">Audience</text>
              </g>

              {/* Node 3: Analytics */}
              <g transform="translate(380, 200)">
                <circle cx="0" cy="0" r="20" fill="#FFFFFF" stroke="#6D5DF5" strokeWidth="1.5" />
                <text x="0" y="34" textAnchor="middle" className="orbit-node-label">Analytics</text>
              </g>

              {/* Node 4: Growth */}
              <g transform="translate(280, 300)">
                <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#FF7E67" strokeWidth="1.5" />
                <text x="0" y="32" textAnchor="middle" className="orbit-node-label">Growth</text>
              </g>

              {/* Node 5: Leads */}
              <g transform="translate(120, 240)">
                <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#6D5DF5" strokeWidth="1.5" />
                <text x="0" y="30" textAnchor="middle" className="orbit-node-label">Leads</text>
              </g>
            </svg>
          </div>

          {/* Minimal Feature Pills */}
          <div className="mekka-feature-pills">
            <span className="mekka-pill"><span className="pill-dot dot-violet"></span> Digital growth infrastructure</span>
            <span className="mekka-pill"><span className="pill-dot dot-coral"></span> Enterprise workspace setup</span>
          </div>

        </div>

        {/* Right Section & Floating Refined Form */}
        <div className="mekka-form-section">
          
          {/* Mobile Top Brand Lockup */}
          <div className="mekka-mobile-lockup">
            <div className="mekka-signature-mark">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#6D5DF5" />
              </svg>
            </div>
            <div>
              <span className="mekka-brand-name">Shree</span>
              <div className="mekka-brand-tagline">Where marketing moves.</div>
            </div>
          </div>

          <div className="mekka-floating-card">
            
            <div className="mekka-card-head">
              <h2>Request access</h2>
              <p>Create a new workspace account to get started.</p>
            </div>

            {error && (
              <div className="mekka-error-banner" role="alert">
                <span className="error-dot"></span>
                <div>
                  <strong className="error-head">Couldn't create account</strong>
                  <p className="error-text">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} autoComplete="off" className="mekka-form">
              
              <div className="mekka-field-group">
                <label htmlFor="name">Full Name</label>
                <div className="mekka-input-box">
                  <User className="mekka-icon-left" size={17} />
                  <input 
                    id="name"
                    type="text" 
                    className="mekka-input with-left-icon" 
                    name="name"
                    value={name}
                    onChange={onChange}
                    required 
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="mekka-field-group">
                <label htmlFor="email">Email address</label>
                <div className="mekka-input-box">
                  <Mail className="mekka-icon-left" size={17} />
                  <input 
                    id="email"
                    type="email" 
                    className="mekka-input with-left-icon" 
                    name="email"
                    value={email}
                    onChange={onChange}
                    required 
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="mekka-field-group">
                <label htmlFor="password">Password</label>
                <div className="mekka-input-box">
                  <Lock className="mekka-icon-left" size={17} />
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    className="mekka-input with-left-icon with-right-action" 
                    name="password"
                    value={password}
                    onChange={onChange}
                    required 
                    placeholder="••••••••••••"
                    minLength="6"
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="mekka-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="mekka-continue-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="mekka-btn-loader"></span>
                ) : (
                  <>
                    <span>Create workspace</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

            </form>

            <div className="mekka-card-foot">
              <p>Already have an account? <Link to="/login" className="mekka-link">Sign in</Link></p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer Signature */}
      <footer className="mekka-page-footer">
        <span>© Shree Platform</span>
        <span className="footer-dot">•</span>
        <span>Privacy & Terms</span>
      </footer>
    </div>
  );
};

export default Register;
