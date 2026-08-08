import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import './MainLayout.css';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [mobileMenuOpen]);

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <div className="logo-icon-small">∞</div>
          <span style={{ fontWeight: 600 }}>Shree</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationCenter />
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      
      <div className="layout-content">
        {/* DESKTOP GLOBAL HEADER */}
        <div className="desktop-header">
          <NotificationCenter />
        </div>
        
        {/* MAIN PAGE CONTENT */}
        <div className="layout-page-wrapper">
          <Outlet />
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </div>
  );
};

export default MainLayout;