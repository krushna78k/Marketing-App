import { useState, useRef, useEffect } from 'react';
import EmailEditor from 'react-email-editor';
import { Send, Save, Eye, FileText, BarChart2, Bell, HelpCircle, User, Check, Clock, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './EmailBuilder.css'; 

const mockChartData = [
  { date: 'Mon', openRate: 42, clickRate: 12 },
  { date: 'Tue', openRate: 45, clickRate: 15 },
  { date: 'Wed', openRate: 51, clickRate: 18 },
  { date: 'Thu', openRate: 48, clickRate: 14 },
  { date: 'Fri', openRate: 60, clickRate: 22 },
  { date: 'Sat', openRate: 55, clickRate: 19 },
  { date: 'Sun', openRate: 58, clickRate: 21 },
];

const mockCampaigns = [
  { id: 1, name: 'Summer Flash Sale', sent: '12,450', delivered: '99.1%', opened: '42.3%', clicked: '12.4%', status: 'Delivered', date: 'Aug 1, 2026' },
  { id: 2, name: 'Welcome Series - Day 1', sent: '3,200', delivered: '98.5%', opened: '65.2%', clicked: '24.1%', status: 'Delivered', date: 'Aug 3, 2026' },
  { id: 3, name: 'August Newsletter', sent: '-', delivered: '-', opened: '-', clicked: '-', status: 'Scheduled', date: 'Aug 10, 2026' },
  { id: 4, name: 'Re-engagement Promo', sent: '-', delivered: '-', opened: '-', clicked: '-', status: 'Draft', date: '-' },
];

const EmailBuilder = () => {
  const emailEditorRef = useRef(null);
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'dispatch', 'reports'
  const [templates, setTemplates] = useState([]);
  
  // Template states
  const [subject, setSubject] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  
  // Dispatch states
  const [dispatchStep, setDispatchStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [audience, setAudience] = useState('all');
  const [scheduledFor, setScheduledFor] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/emails/templates`, {
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/emails/templates`, {
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
          setLastSaved(new Date());
          fetchTemplates();
          // Optional: Show toast instead of alert for better UX
        }
      } catch (err) {
        console.error('Save failed', err);
      }
    });
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !campaignTitle) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/emails/dispatch`, {
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
        setCampaignTitle('');
        setSelectedTemplateId('');
        setScheduledFor('');
        setDispatchStep(1);
        setActiveTab('reports');
      }
    } catch (err) {
      console.error('Dispatch failed', err);
    }
  };

  return (
    <div className="eb-wrapper page-content">
      
      {/* GLOBAL HEADER */}
      <div className="eb-header-top">
        <div className="eb-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1>Email Marketing Suite</h1>
            <div className="eb-status-badge">
              <span className="eb-status-dot"></span> Campaign System Online
            </div>
          </div>
          <p>Design beautiful emails, dispatch campaigns, and track delivery.</p>
        </div>
        
        <div className="eb-header-actions">
          <div className="eb-segmented-control">
            <button className={`eb-tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
              <FileText size={16} /> Builder
            </button>
            <button className={`eb-tab ${activeTab === 'dispatch' ? 'active' : ''}`} onClick={() => setActiveTab('dispatch')}>
              <Send size={16} /> Campaigns
            </button>
            <button className={`eb-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <BarChart2 size={16} /> Reports
            </button>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
          <div className="eb-icon-btn"><Bell size={18} /></div>
          <div className="eb-icon-btn"><HelpCircle size={18} /></div>
          <div className="eb-icon-btn" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)' }}><User size={18} /></div>
        </div>
      </div>

      {/* --------------------------------------------------- */}
      {/* BUILDER TAB */}
      {/* --------------------------------------------------- */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '800px' }}>
          
          <div className="eb-config-bar">
            <div className="eb-input-group">
              <label className="eb-label">Template Name</label>
              <input 
                type="text" 
                className="eb-input" 
                placeholder="e.g. Summer Promotion" 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="eb-input-group" style={{ flex: 1.5 }}>
              <label className="eb-label">Email Subject Line</label>
              <input 
                type="text" 
                className="eb-input" 
                placeholder="e.g. Get 20% off this summer, {{first_name}}" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="eb-input-group" style={{ flex: 1.5 }}>
              <label className="eb-label">Preview Text (Optional)</label>
              <input 
                type="text" 
                className="eb-input" 
                placeholder="Your exclusive summer offer is waiting..." 
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
            </div>
            <div className="eb-save-area">
              <button className="eb-save-btn" onClick={handleSave}>
                <Save size={16}/> Save Template
              </button>
              {lastSaved && (
                <span className="eb-last-saved">
                  <Check size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                  Saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              )}
            </div>
          </div>
          
          <div className="eb-builder-container">
            {/* 
              We use Unlayer's configuration options to match the requested premium SaaS aesthetic.
              We inject custom CSS into the iframe to restyle the empty state and sidebars.
            */}
            <EmailEditor 
              ref={emailEditorRef} 
              style={{ flex: 1, minHeight: 0, width: '100%' }}
              options={{ 
                appearance: { 
                  theme: 'dark',
                  panels: {
                    tools: {
                      dock: 'left' // Move tools to the left sidebar as requested in the 3-panel layout
                    }
                  }
                },
                customCSS: [
                  `
                  .blockbuilder-placeholder-empty { color: #64748b !important; font-family: Inter, sans-serif !important; }
                  .blockbuilder-placeholder-empty:after { content: "Start building your email. Drag a content block here or choose a template to get started." !important; font-size: 14px; }
                  `
                ]
              }}
            />
          </div>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* CAMPAIGNS (DISPATCH) TAB */}
      {/* --------------------------------------------------- */}
      {activeTab === 'dispatch' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div className="eb-dispatch-wizard">
            
            <div className="eb-step-indicator">
              <div className={`eb-step ${dispatchStep >= 1 ? 'active' : ''}`}>
                <div className="eb-step-circle">1</div>
                <div className="eb-step-label">Template</div>
              </div>
              <div className={`eb-step ${dispatchStep >= 2 ? 'active' : ''}`}>
                <div className="eb-step-circle">2</div>
                <div className="eb-step-label">Audience</div>
              </div>
              <div className={`eb-step ${dispatchStep >= 3 ? 'active' : ''}`}>
                <div className="eb-step-circle">3</div>
                <div className="eb-step-label">Configure</div>
              </div>
              <div className={`eb-step ${dispatchStep >= 4 ? 'active' : ''}`}>
                <div className="eb-step-circle">4</div>
                <div className="eb-step-label">Schedule</div>
              </div>
            </div>

            <div className="eb-card">
              <form onSubmit={handleDispatch}>
                
                {dispatchStep === 1 && (
                  <div>
                    <h3 className="eb-card-title">Select Email Template</h3>
                    <div className="eb-input-group" style={{ marginBottom: '24px' }}>
                      <label className="eb-label">Saved Templates</label>
                      <select 
                        className="eb-input" 
                        value={selectedTemplateId} 
                        onChange={(e) => setSelectedTemplateId(e.target.value)} 
                        style={{ padding: '12px' }}
                      >
                        <option value="">-- Choose a template --</option>
                        {templates.map(t => (
                          <option key={t._id} value={t._id}>{t.name} (Subj: {t.subject})</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" className="eb-save-btn" onClick={() => { if(selectedTemplateId) setDispatchStep(2) }} disabled={!selectedTemplateId}>
                      Continue to Audience <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {dispatchStep === 2 && (
                  <div>
                    <h3 className="eb-card-title">Select Audience</h3>
                    <div className="eb-input-group" style={{ marginBottom: '24px' }}>
                      <label className="eb-label">Target Segment</label>
                      <select className="eb-input" value={audience} onChange={(e) => setAudience(e.target.value)} style={{ padding: '12px' }}>
                        <option value="all">All Qualified Leads (2,450 recipients)</option>
                        <option value="newsletter">Newsletter Subscribers (1,120 recipients)</option>
                        <option value="customers">Existing Customers (840 recipients)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button type="button" className="eb-save-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setDispatchStep(1)}>Back</button>
                      <button type="button" className="eb-save-btn" onClick={() => setDispatchStep(3)}>Continue to Sender <ChevronRight size={16} /></button>
                    </div>
                  </div>
                )}

                {dispatchStep === 3 && (
                  <div>
                    <h3 className="eb-card-title">Configure Sender</h3>
                    <div className="eb-input-group" style={{ marginBottom: '16px' }}>
                      <label className="eb-label">Campaign Name (Internal)</label>
                      <input type="text" className="eb-input" value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)} placeholder="e.g. Summer Promo Blast" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div className="eb-input-group">
                        <label className="eb-label">From Name</label>
                        <input type="text" className="eb-input" defaultValue="Marketing Team" />
                      </div>
                      <div className="eb-input-group">
                        <label className="eb-label">From Email</label>
                        <input type="email" className="eb-input" defaultValue="hello@yourcompany.com" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button type="button" className="eb-save-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setDispatchStep(2)}>Back</button>
                      <button type="button" className="eb-save-btn" onClick={() => { if(campaignTitle) setDispatchStep(4) }} disabled={!campaignTitle}>Continue to Schedule <ChevronRight size={16} /></button>
                    </div>
                  </div>
                )}

                {dispatchStep === 4 && (
                  <div>
                    <h3 className="eb-card-title">Schedule & Send</h3>
                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '12px' }}>Final Summary</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem', lineHeight: '1.8' }}>
                        <li><span style={{ color: '#94a3b8', display: 'inline-block', width: '150px' }}>Recipients:</span> <strong>2,450</strong></li>
                        <li><span style={{ color: '#94a3b8', display: 'inline-block', width: '150px' }}>Estimated delivery:</span> <strong>~2 min</strong></li>
                        <li><span style={{ color: '#94a3b8', display: 'inline-block', width: '150px' }}>Unsubscribe link:</span> <span style={{ color: '#34d399' }}>Enabled</span></li>
                        <li><span style={{ color: '#94a3b8', display: 'inline-block', width: '150px' }}>Tracking:</span> <span style={{ color: '#34d399' }}>Enabled</span></li>
                      </ul>
                    </div>
                    
                    <div className="eb-input-group" style={{ marginBottom: '24px' }}>
                      <label className="eb-label"><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Schedule for Later (Optional)</label>
                      <input 
                        type="datetime-local" 
                        className="eb-input" 
                        value={scheduledFor} 
                        onChange={(e) => setScheduledFor(e.target.value)} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button type="button" className="eb-save-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setDispatchStep(3)}>Back</button>
                      <button type="submit" className="eb-save-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <Send size={18} /> {scheduledFor ? 'Schedule Campaign' : 'Send Campaign Now'}
                      </button>
                    </div>
                  </div>
                )}
                
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* REPORTS TAB */}
      {/* --------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          
          <div className="eb-reports-grid">
            <div className="eb-stat-card">
              <div className="eb-stat-label">Total Sent</div>
              <div className="eb-stat-value">12,450</div>
            </div>
            <div className="eb-stat-card">
              <div className="eb-stat-label">Delivered <span style={{ color: '#34d399', fontSize: '0.75rem', marginLeft: 'auto' }}>98.7%</span></div>
              <div className="eb-stat-value" style={{ color: '#34d399' }}>12,288</div>
            </div>
            <div className="eb-stat-card">
              <div className="eb-stat-label">Opened <span style={{ color: '#60a5fa', fontSize: '0.75rem', marginLeft: 'auto' }}>64.3%</span></div>
              <div className="eb-stat-value" style={{ color: '#60a5fa' }}>7,901</div>
            </div>
            <div className="eb-stat-card">
              <div className="eb-stat-label">Clicked <span style={{ color: '#818cf8', fontSize: '0.75rem', marginLeft: 'auto' }}>18.6%</span></div>
              <div className="eb-stat-value" style={{ color: '#818cf8' }}>2,285</div>
            </div>
            <div className="eb-stat-card">
              <div className="eb-stat-label">Bounced <span style={{ color: '#f87171', fontSize: '0.75rem', marginLeft: 'auto' }}>1.2%</span></div>
              <div className="eb-stat-value" style={{ color: '#f87171' }}>149</div>
            </div>
          </div>

          <div className="eb-reports-charts">
            <div className="eb-card">
              <h3 className="eb-card-title" style={{ fontSize: '1rem', marginBottom: '16px', border: 'none' }}>Engagement Over Time</h3>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="openRate" name="Open Rate %" stroke="#60a5fa" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="clickRate" name="Click Rate %" stroke="#818cf8" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="eb-card">
              <h3 className="eb-card-title" style={{ fontSize: '1rem', marginBottom: '16px', border: 'none' }}>Top Performing</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Welcome Series</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Automated</div>
                  </div>
                  <div style={{ color: '#34d399', fontWeight: '600' }}>65.2% Open</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Summer Flash Sale</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Broadcast</div>
                  </div>
                  <div style={{ color: '#34d399', fontWeight: '600' }}>42.3% Open</div>
                </div>
              </div>
            </div>
          </div>

          <div className="eb-table-container">
            <table className="eb-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Delivered</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.map(camp => (
                  <tr key={camp.id}>
                    <td style={{ fontWeight: '500' }}>{camp.name}</td>
                    <td>
                      <span className={`eb-badge ${camp.status.toLowerCase()}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td>{camp.sent}</td>
                    <td>{camp.delivered}</td>
                    <td>{camp.opened}</td>
                    <td>{camp.clicked}</td>
                    <td style={{ color: '#94a3b8' }}>{camp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};

export default EmailBuilder;
