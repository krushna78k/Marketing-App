import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Tag, DollarSign, Layout, Layers, LogOut, Settings, MessageSquare, Mail, MessageCircle, Share2, Globe, List, GitCommit, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} /> },
    { name: 'Offers', path: '/campaigns', icon: <Tag size={20} /> },
    { name: 'Deals', path: '/pipeline', icon: <DollarSign size={20} /> },
    { name: 'Brands', path: '/leads', icon: <Layout size={20} /> },
    { name: 'Agencies', path: '/calendar', icon: <Layers size={20} /> },
    { name: 'Email Marketing', path: '/email-builder', icon: <Mail size={20} /> },
    { name: 'SMS Marketing', path: '/sms-marketing', icon: <MessageSquare size={20} /> },
    { name: 'WhatsApp Marketing', path: '/whatsapp-marketing', icon: <MessageCircle size={20} /> },
    { name: 'Social Media', path: '/social-management', icon: <Share2 size={20} /> },
    { name: 'Landing Pages', path: '/landing-builder', icon: <Globe size={20} /> },
    { name: 'Forms', path: '/form-builder', icon: <List size={20} /> },
    { name: 'Automations', path: '/workflow', icon: <GitCommit size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div 
        className="sidebar-header" 
        onClick={() => setIsCollapsed(false)}
        onDoubleClick={() => setIsCollapsed(true)}
        title="Single click to expand, Double click to collapse"
        style={{ cursor: 'pointer' }}
      >
        <div className="logo-icon">∞</div>
        {!isCollapsed && <h2>Mekka</h2>}
      </div>
      
      <div className="nav-menu">
        {navLinks.map((link) => (
          <NavLink 
            to={link.path} 
            key={link.name}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            title={isCollapsed ? link.name : ""}
          >
            {link.icon}
            {!isCollapsed && <span>{link.name}</span>}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        {!isCollapsed ? (
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Admin'}</span>
            </div>
          </div>
        ) : (
          <div className="user-avatar" style={{ margin: '0 auto', marginBottom: '16px' }} title={user?.name || 'User'}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
