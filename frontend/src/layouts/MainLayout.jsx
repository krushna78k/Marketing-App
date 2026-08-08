import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100%', width: '100vw', padding: '24px', gap: '24px', boxSizing: 'border-box' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden' }}>
        {/* GLOBAL HEADER (For Notifications) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 24px 16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <NotificationCenter />
        </div>
        
        {/* MAIN PAGE CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;