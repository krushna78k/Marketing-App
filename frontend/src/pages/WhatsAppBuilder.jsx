import { useState, useEffect } from 'react';
import { Send, Save, MessageCircle, BarChart2, Image as ImageIcon } from 'lucide-react';
// Reusing premium tab styles from EmailBuilder.css
import './EmailBuilder.css'; 

const WhatsAppBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates'); 
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  
  // Dispatch states
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/templates', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Error fetching templates', err);
    }
  };

  const handleSave = async () => {
    if (!templateName || !content) return alert('Please fill in both name and content.');

    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          name: templateName,
          content: content,
          mediaUrl: mediaUrl
        })
      });
      
      if (res.ok) {
        alert('WhatsApp Template Saved!');
        fetchTemplates();
        setTemplateName('');
        setContent('');
        setMediaUrl('');
      }
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save WhatsApp template');
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !campaignTitle) return alert('Please fill in required fields');

    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          title: campaignTitle,
          templateId: selectedTemplateId,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null
        })
      });

      if (res.ok) {
        alert(scheduledFor ? 'WhatsApp Campaign Scheduled!' : 'WhatsApp Broadcast Dispatched!');
        setCampaignTitle('');
        setSelectedTemplateId('');
        setScheduledFor('');
        setActiveTab('reports');
      }
    } catch (err) {
      alert('Dispatch failed');
    }
  };

  return (
    <div className="page-content email-builder-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <div className="page-header" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={28} color="#25D366" /> WhatsApp Marketing
          </h1>
          <p>Design WhatsApp messages, attach media, broadcast campaigns, and track read receipts.</p>
        </div>
        
        <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px' }}>
          <button 
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} 
            onClick={() => setActiveTab('templates')}
          >
            <MessageCircle size={16} /> Builder
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dispatch')}
          >
            <Send size={16} /> Broadcast
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} 
            onClick={() => setActiveTab('reports')}
          >
            <BarChart2 size={16} /> Reports
          </button>
        </div>
      </div>

      {/* TEMPLATE BUILDER TAB */}
      {activeTab === 'templates' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Create WhatsApp Template
          </h2>
          
          <div className="form-group">
            <label>Template Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Webinar Invite" 
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><ImageIcon size={14} style={{display:'inline', marginRight:'4px'}}/> Attach Media URL (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://example.com/image.jpg" 
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            {mediaUrl && (
              <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '200px' }}>
                <img src={mediaUrl} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Message Content <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Supports *bold*, _italic_, ~strikethrough~)</span></label>
            <textarea 
              className="input-field" 
              rows="6"
              placeholder="Hi {{first_name}}, join our exclusive *Live Webinar* today! 🚀&#10;&#10;Click here: https://link.com"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
            <Save size={18}/> Save Template
          </button>
        </div>
      )}

      {/* DISPATCH TAB */}
      {activeTab === 'dispatch' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Broadcast WhatsApp Campaign
          </h2>
          <form onSubmit={handleDispatch}>
            <div className="form-group">
              <label>Campaign Title (Internal)</label>
              <input 
                type="text" 
                className="input-field" 
                value={campaignTitle} 
                onChange={(e) => setCampaignTitle(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Select Saved Template</label>
              <select 
                className="input-field" 
                value={selectedTemplateId} 
                onChange={(e) => setSelectedTemplateId(e.target.value)} 
                required
              >
                <option value="">-- Choose a WhatsApp template --</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name} {t.mediaUrl ? '📸' : '📝'}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Schedule Broadcast (Optional)</label>
              <input 
                type="datetime-local" 
                className="input-field" 
                value={scheduledFor} 
                onChange={(e) => setScheduledFor(e.target.value)} 
              />
              <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>Leave blank to broadcast instantly to all Leads with a phone number.</small>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center', background: '#25D366' }}>
              <Send size={18} /> {scheduledFor ? 'Schedule Broadcast' : 'Send Broadcast Now'}
            </button>
          </form>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc' }}>Delivery & Read Receipts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            
            <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '8px' }}>Messages Sent</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa' }}>12,850</div>
            </div>
            
            <div className="stat-card" style={{ background: 'rgba(156, 163, 175, 0.2)', border: '1px solid rgba(156, 163, 175, 0.3)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{color: '#9ca3af'}}>✓✓</span> Delivered
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f3f4f6' }}>95.0%</div>
            </div>
            
            <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <span style={{color: '#60a5fa'}}>✓✓</span> Read Rate
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa' }}>82.4%</div>
            </div>

          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>Conversation History</h3>
            <div className="text-muted text-sm">Detailed logs and read-receipt timestamps will populate here via webhooks.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppBuilder;
