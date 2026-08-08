import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Tag, DollarSign, Layout, Layers, LogOut, Settings, MessageSquare, Mail, MessageCircle, Share2, Globe, List, GitCommit, BarChart2, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={18} /> },
    { name: 'Offers', path: '/campaigns', icon: <Tag size={18} /> },
    { name: 'Deals', path: '/pipeline', icon: <DollarSign size={18} /> },
    { name: 'Brands', path: '/leads', icon: <Layout size={18} /> },
    { name: 'Agencies', path: '/calendar', icon: <Layers size={18} /> },
    { name: 'Email Marketing', path: '/email-builder', icon: <Mail size={18} /> },
    { name: 'SMS Marketing', path: '/sms-marketing', icon: <MessageSquare size={18} /> },
    { name: 'WhatsApp Marketing', path: '/whatsapp-marketing', icon: <MessageCircle size={18} /> },
    { name: 'Social Media', path: '/social-management', icon: <Share2 size={18} /> },
    { name: 'Landing Pages', path: '/landing-builder', icon: <Globe size={18} /> },
    { name: 'Forms', path: '/form-builder', icon: <List size={18} /> },
    { name: 'Automations', path: '/workflow', icon: <GitCommit size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="logo-icon">∞</div>
          {!isCollapsed && (
            <div className="brand-text-group">
              <h2>Shree</h2>
              <span className="brand-tagline-sub">Digital Marketing</span>
            </div>
          )}
        </div>
        {mobileOpen && (
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="nav-menu">
        {navLinks.map((link) => (
          <NavLink 
            to={link.path} 
            key={link.name}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            title={isCollapsed ? link.name : ""}
            onClick={() => { if (mobileOpen) setMobileOpen(false) }}
          >
            <span className="nav-icon">{link.icon}</span>
            {!isCollapsed && <span className="nav-text">{link.name}</span>}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">{user?.name || 'krushna kamble'}</span>
              <span className="user-role">{user?.role || 'Super Admin'}</span>
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
