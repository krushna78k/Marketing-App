import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportsHub from './pages/ReportsHub';
import CampaignList from './pages/CampaignList';
import LeadList from './pages/LeadList';
import SalesPipeline from './pages/SalesPipeline';
import TaskCalendar from './pages/TaskCalendar';
import EmailBuilder from './pages/EmailBuilder';
import SmsBuilder from './pages/SmsBuilder';
import WhatsAppBuilder from './pages/WhatsAppBuilder';
import SocialManager from './pages/SocialManager';
import LandingPageBuilder from './pages/LandingPageBuilder';
import FormBuilder from './pages/FormBuilder';
import WorkflowAutomation from './pages/WorkflowAutomation';
import Profile from './pages/Profile';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import './index.css';

// Placeholder components for other sidebar links
const Placeholder = ({ title }) => (
  <div style={{ padding: '32px' }}>
    <h2>{title}</h2>
    <p>This module will be built in a future phase.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive', 'Viewer']}><Dashboard /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><ReportsHub /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><CampaignList /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive']}><LeadList /></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Executive']}><SalesPipeline /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Executive']}><TaskCalendar /></ProtectedRoute>} />
            <Route path="/email-builder" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><EmailBuilder /></ProtectedRoute>} />
            <Route path="/sms-marketing" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><SmsBuilder /></ProtectedRoute>} />
            <Route path="/whatsapp-marketing" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><WhatsAppBuilder /></ProtectedRoute>} />
            <Route path="/social-management" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><SocialManager /></ProtectedRoute>} />
            <Route path="/landing-builder" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><LandingPageBuilder /></ProtectedRoute>} />
            <Route path="/form-builder" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><FormBuilder /></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><WorkflowAutomation /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive', 'Viewer']}><Profile /></ProtectedRoute>} />
            <Route path="/media" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Marketing Manager']}><MediaLibrary /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
