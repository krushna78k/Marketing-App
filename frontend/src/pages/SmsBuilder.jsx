import { useState, useEffect } from 'react';
import { Send, Save, MessageSquare, BarChart2, Smartphone } from 'lucide-react';
// We can reuse the premium tab styles from EmailBuilder.css
import './EmailBuilder.css'; 

const SmsBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'dispatch', 'reports'
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [content, setContent] = useState('');
  
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
      const res = await fetch('http://localhost:5000/api/sms/templates', {
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
    if (content.length > 160) return alert('SMS content must be 160 characters or less.');

    try {
      const res = await fetch('http://localhost:5000/api/sms/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          name: templateName,
          content: content
        })
      });
      
      if (res.ok) {
        alert('SMS Template Saved!');
        fetchTemplates();
        setTemplateName('');
        setContent('');
      }
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save SMS template');
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !campaignTitle) return alert('Please fill in required fields');

    try {
      const res = await fetch('http://localhost:5000/api/sms/dispatch', {
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
        alert(scheduledFor ? 'SMS Campaign Scheduled!' : 'SMS Broadcast Dispatched Successfully!');
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
            <Smartphone size={28} color="#3b82f6" /> SMS Marketing Suite
          </h1>
          <p>Design text messages, dispatch campaigns in bulk, and track delivery logs.</p>
        </div>
        
        <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px' }}>
          <button 
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} 
            onClick={() => setActiveTab('templates')}
          >
            <MessageSquare size={16} /> Builder
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dispatch')}
          >
            <Send size={16} /> Dispatch
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
            Create SMS Template
          </h2>
          
          <div className="form-group">
            <label>Template Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Flash Sale Alert" 
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ position: 'relative' }}>
            <label>SMS Content <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Supports {'{{first_name}}'})</span></label>
            <textarea 
              className="input-field" 
              rows="4"
              placeholder="Hi {{first_name}}, our huge weekend sale starts now! Use code SAVE20 at checkout."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ paddingBottom: '30px' }}
            />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '0.8rem', color: content.length > 160 ? '#f87171' : '#94a3b8' }}>
              {content.length} / 160
            </div>
          </div>
          
          {content.length > 160 && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
              Warning: Texts over 160 characters may be split into multiple messages and cost more.
            </div>
          )}

          <button className="btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
            <Save size={18}/> Save Template
          </button>
        </div>
      )}

      {/* DISPATCH TAB */}
      {activeTab === 'dispatch' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Dispatch SMS Campaign
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
                <option value="">-- Choose an SMS template --</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.content.substring(0, 30)}...)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Schedule Delivery (Optional)</label>
              <input 
                type="datetime-local" 
                className="input-field" 
                value={scheduledFor} 
                onChange={(e) => setScheduledFor(e.target.value)} 
              />
              <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>Leave blank to dispatch immediately to all applicable Leads with phone numbers.</small>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
              <Send size={18} /> {scheduledFor ? 'Schedule SMS Blast' : 'Send Blast Now'}
            </button>
          </form>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc' }}>SMS Delivery Reports</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            
            {/* Mock Report Cards for Demo */}
            <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '8px' }}>Total Texts Sent</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa' }}>45,210</div>
            </div>
            
            <div className="stat-card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#a7f3d0', fontSize: '0.9rem', marginBottom: '8px' }}>Delivery Rate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#34d399' }}>98.5%</div>
            </div>
            
            <div className="stat-card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '8px' }}>Failed Delivery</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f87171' }}>1.5%</div>
            </div>

          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>Delivery Logs (Real-time)</h3>
            <div className="text-muted text-sm">Detailed logs (Phone Number, Status, Timestamp) will populate here via webhooks.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsBuilder;
