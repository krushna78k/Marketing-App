import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Mail, Smartphone, Radio, AlertCircle } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, simulateAlert } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      handleMarkRead(notif._id);
    }
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const handleSimulate = async () => {
    try {
      await simulateAlert({
        title: 'New Lead Assigned',
        message: 'A new enterprise lead has been assigned to you. Follow up immediately.',
        channels: ['In-App', 'Email', 'SMS', 'Push'],
        link: '/leads'
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'Email': return <Mail size={12} color="#3b82f6" />;
      case 'SMS': return <Smartphone size={12} color="#10b981" />;
      case 'Push': return <Radio size={12} color="#a855f7" />;
      default: return <Bell size={12} color="#6366f1" />;
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      
      {/* BELL ICON */}
      <div className="bell-container" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={24} color={unreadCount > 0 ? '#f8fafc' : '#94a3b8'} />
        {unreadCount > 0 && (
          <span className="badge-count pulse">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <div className="notification-dropdown glass-panel">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="text-btn text-sm" onClick={handleMarkAllRead}>
                <CheckCircle size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-icon">
                    <AlertCircle size={20} color={!notif.isRead ? '#6366f1' : '#64748b'} />
                  </div>
                  <div className="notif-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <div className="notif-meta">
                      <span className="notif-time">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <div className="notif-channels">
                        {notif.channels.map(ch => (
                          <span key={ch} title={`Sent via ${ch}`}>{getChannelIcon(ch)}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {!notif.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Bell size={32} color="#475569" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          <div className="dropdown-footer">
            <button className="btn-secondary w-full" onClick={handleSimulate} style={{ fontSize: '0.8rem', padding: '6px' }}>
              Simulate Test Alert
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationCenter;
