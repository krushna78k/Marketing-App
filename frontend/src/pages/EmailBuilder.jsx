import { useState, useRef, useEffect } from 'react';
import EmailEditor from 'react-email-editor';
import { Send, Save, Eye, FileText, BarChart2, CheckCircle, Clock } from 'lucide-react';
import './EmailBuilder.css'; // We'll create this file next for premium styling

const EmailBuilder = () => {
  const emailEditorRef = useRef(null);
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'dispatch', 'reports'
  const [templates, setTemplates] = useState([]);
  const [subject, setSubject] = useState('');
  const [templateName, setTemplateName] = useState('');
  
  // Dispatch states
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  // Mock token
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/emails/templates', {
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

  const handleSave = () => {
    if (!emailEditorRef.current) return;
    
    emailEditorRef.current.editor.exportHtml(async (data) => {
      const { design, html } = data;
      
      try {
        const res = await fetch('http://localhost:5000/api/emails/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            name: templateName || 'Untitled Template',
            subject: subject || 'No Subject',
            content: html,
            design: design
          })
        });
        
        if (res.ok) {
          alert('Template Saved Successfully!');
          fetchTemplates();
          setTemplateName('');
          setSubject('');
        }
      } catch (err) {
        console.error('Save failed', err);
        alert('Failed to save template');
      }
    });
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !campaignTitle) return alert('Please fill in required fields');

    try {
      const res = await fetch('http://localhost:5000/api/emails/dispatch', {
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
        alert(scheduledFor ? 'Campaign Scheduled!' : 'Broadcast Dispatched Successfully!');
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
          <h1>Email Marketing Suite</h1>
          <p>Design beautiful emails, dispatch campaigns, and track delivery.</p>
        </div>
        
        <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px' }}>
          <button 
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} 
            onClick={() => setActiveTab('templates')}
          >
            <FileText size={16} /> Builder
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Template Name (e.g. Summer Promo v1)" 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 2, margin: 0 }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Email Subject Line (supports {{first_name}})" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={handleSave} style={{ whiteSpace: 'nowrap' }}>
              <Save size={18}/> Save Template
            </button>
          </div>
          
          <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <EmailEditor 
              ref={emailEditorRef} 
              style={{ height: '100%' }}
              options={{ appearance: { theme: 'modern_light' } }}
            />
          </div>
        </div>
      )}

      {/* DISPATCH TAB */}
      {activeTab === 'dispatch' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Create Email Campaign
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
              <label>Select Template</label>
              <select 
                className="input-field" 
                value={selectedTemplateId} 
                onChange={(e) => setSelectedTemplateId(e.target.value)} 
                required
              >
                <option value="">-- Choose a saved template --</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name} (Subj: {t.subject})</option>
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
              <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>Leave blank to dispatch immediately to all applicable Leads.</small>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
              <Send size={18} /> {scheduledFor ? 'Schedule Campaign' : 'Dispatch Now'}
            </button>
          </form>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc' }}>Delivery Reports</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            
            {/* Mock Report Cards for Demo */}
            <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '8px' }}>Total Sent</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa' }}>12,450</div>
            </div>
            
            <div className="stat-card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#a7f3d0', fontSize: '0.9rem', marginBottom: '8px' }}>Average Open Rate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#34d399' }}>48.2%</div>
            </div>
            
            <div className="stat-card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '8px' }}>Bounce Rate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f87171' }}>1.4%</div>
            </div>

          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>Recent Campaigns</h3>
            <div className="text-muted text-sm">Campaign history and real-time pixel tracking stats will appear here.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailBuilder;
