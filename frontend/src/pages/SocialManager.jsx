import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Send, Save, Share2, BarChart2, Calendar as CalendarIcon, Image as ImageIcon, Users, Camera, Briefcase, MessageSquare, PlayCircle } from 'lucide-react';
// Reusing premium tab styles
import './EmailBuilder.css'; 
// Reusing TaskCalendar styles for the calendar
import './TaskCalendar.css';

const localizer = momentLocalizer(moment);

const SocialManager = () => {
  const [activeTab, setActiveTab] = useState('composer'); // 'composer', 'calendar', 'analytics'
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  // Composer states
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduledFor, setScheduledFor] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPosts();
    fetchAnalytics();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/social/posts`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/social/analytics`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics', err);
    }
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = async (status) => {
    if (!content || selectedPlatforms.length === 0) {
      return alert('Please write some content and select at least one platform.');
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/social/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          content,
          mediaUrl,
          platforms: selectedPlatforms,
          status: status, // 'Draft', 'Scheduled', 'Published'
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null
        })
      });
      
      if (res.ok) {
        alert(`Post ${status}!`);
        fetchPosts();
        if (status === 'Published') fetchAnalytics();
        setContent('');
        setMediaUrl('');
        setSelectedPlatforms([]);
        setScheduledFor('');
        if (status === 'Scheduled') setActiveTab('calendar');
        if (status === 'Published') setActiveTab('analytics');
      }
    } catch (err) {
      alert('Failed to save post');
    }
  };

  // Map posts to calendar events
  const events = posts.filter(p => p.status === 'Scheduled' || p.status === 'Published').map(post => ({
    title: `[${post.platforms.join(', ')}] ${post.content.substring(0, 30)}...`,
    start: new Date(post.scheduledFor || post.publishedAt || post.createdAt),
    end: new Date(post.scheduledFor || post.publishedAt || post.createdAt),
    allDay: false,
    resource: post
  }));

  const platformIcons = {
    Facebook: <Users size={18} />,
    Instagram: <Camera size={18} />,
    LinkedIn: <Briefcase size={18} />,
    X: <MessageSquare size={18} />,
    YouTube: <PlayCircle size={18} />
  };

  return (
    <div className="page-content email-builder-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <div className="page-header" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={28} color="#8b5cf6" /> Social Command Center
          </h1>
          <p>Draft, schedule, and publish content across all your social media platforms simultaneously.</p>
        </div>
        
        <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px' }}>
          <button className={`tab-btn ${activeTab === 'composer' ? 'active' : ''}`} onClick={() => setActiveTab('composer')}>
            <Share2 size={16} /> Composer
          </button>
          <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <CalendarIcon size={16} /> Calendar View
          </button>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={16} /> Analytics
          </button>
        </div>
      </div>

      {/* COMPOSER TAB */}
      {activeTab === 'composer' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Omni-Channel Composer
          </h2>
          
          <div className="form-group">
            <label>Select Platforms to Publish To</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              {['Facebook', 'Instagram', 'LinkedIn', 'X', 'YouTube'].map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: '8px', border: '1px solid',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedPlatforms.includes(platform) ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    borderColor: selectedPlatforms.includes(platform) ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
                    color: selectedPlatforms.includes(platform) ? '#c4b5fd' : '#94a3b8'
                  }}
                >
                  {platformIcons[platform]} {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label>Post Content</label>
            <textarea 
              className="input-field" 
              rows="6"
              placeholder="What do you want to share with your audience?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><ImageIcon size={14} style={{display:'inline', marginRight:'4px'}}/> Attach Image/Video URL (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://example.com/media.mp4" 
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ marginTop: '24px' }}>
            <label>Schedule for Later? (Leave blank to publish now or save as draft)</label>
            <input 
              type="datetime-local" 
              className="input-field" 
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleSubmit('Draft')}>
              <Save size={18} /> Save as Draft
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 2, justifyContent: 'center', background: scheduledFor ? '#f59e0b' : '#8b5cf6' }} 
              onClick={() => handleSubmit(scheduledFor ? 'Scheduled' : 'Published')}
            >
              <Send size={18} /> {scheduledFor ? 'Schedule Post' : 'Publish Immediately'}
            </button>
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="glass-panel calendar-wrapper" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '16px', color: '#f8fafc' }}>Social Publishing Calendar</h2>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day']}
              eventPropGetter={(event) => {
                const isPublished = event.resource.status === 'Published';
                return {
                  style: {
                    backgroundColor: isPublished ? '#10b981' : '#f59e0b',
                    borderRadius: '4px',
                    opacity: 0.9,
                    color: '#fff',
                    border: 'none',
                    padding: '2px 6px',
                    fontSize: '0.85rem'
                  }
                };
              }}
            />
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="glass-panel" style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc' }}>Performance Reports & Engagement</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {['Facebook', 'Instagram', 'LinkedIn', 'X', 'YouTube'].map(platform => {
              const stats = analytics[platform];
              if (!stats) return null;
              
              return (
                <div key={platform} className="stat-card" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '24px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4b5fd', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                    {platformIcons[platform]} {platform}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Likes</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.likes.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Comments</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.comments.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Shares</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.shares.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Views</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.views.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialManager;
