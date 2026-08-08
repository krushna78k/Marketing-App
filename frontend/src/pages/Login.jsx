import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Viewer'
  });
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password, role } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const body = JSON.stringify({ email, password, role });
      const res = await axios.post('http://localhost:5000/api/auth/login', body, config);
      localStorage.setItem('token', res.data.token);
      
      // Update global auth state immediately
      const userRes = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'x-auth-token': res.data.token }
      });
      setUser(userRes.data);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-layout">
        
        {/* Left Side: Branding / Corporate */}
        <div className="auth-left">
          <div className="auth-left-content">
            <h1>Enterprise Grade Marketing.</h1>
            <p>Welcome to MarketApp. Scale your campaigns, manage leads, and close deals securely on our industry-leading platform.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your workspace</p>
            </div>
            
            {error && <div className="alert-error"><span>⚠️</span> {error}</div>}
        
        <form onSubmit={onSubmit} autoComplete="off">
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
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Role</label>
            <div className="input-icon-wrapper">
              <select
                className="input-field"
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

          <button type="submit" className="btn-primary auth-submit">
            <LogIn size={20} />
            Sign In
          </button>
        </form>
        
            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Request Access</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
