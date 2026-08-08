import { useState } from 'react';
import { AlignLeft, CheckSquare, Mail, Phone, Save, Code, Settings, List, Trash2, ShieldCheck, Globe } from 'lucide-react';
// Reusing premium tab styles
import './EmailBuilder.css'; 

const FormBuilder = () => {
  const [activeTab, setActiveTab] = useState('builder'); // 'builder', 'settings', 'embed'
  const [formId, setFormId] = useState(null);
  
  // Builder States
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lead Form');
  const [fields, setFields] = useState([]);
  
  // Settings States
  const [enableCaptcha, setEnableCaptcha] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const token = localStorage.getItem('token');

  const addField = (fieldType, label) => {
    setFields([...fields, { id: Date.now().toString(), type: fieldType, label, required: false }]);
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const toggleRequired = (id) => {
    setFields(fields.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const handleSave = async () => {
    if (!title) return alert('Please enter an internal Form Title first.');
    if (fields.length === 0) return alert('Please add at least one field to your form.');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          formId,
          title,
          type,
          fields,
          settings: { enableCaptcha, emailNotifications, webhookUrl }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormId(data._id);
        alert('Form Saved Successfully!');
      } else {
        alert('Save failed');
      }
    } catch (err) {
      alert('Failed to save form');
    }
  };

  return (
    <div className="page-content email-builder-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <div className="page-header" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={28} color="#3b82f6" /> Advanced Form Studio
          </h1>
          <p>Design dynamic Lead, Registration, and Feedback forms. Configure CAPTCHA, webhooks, and validation rules.</p>
        </div>
        
        <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px' }}>
          <button className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`} onClick={() => setActiveTab('builder')}>
            <List size={16} /> Field Builder
          </button>
          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={16} /> Automation & CAPTCHA
          </button>
          <button className={`tab-btn ${activeTab === 'embed' ? 'active' : ''}`} onClick={() => setActiveTab('embed')}>
            <Code size={16} /> Embed Code
          </button>
        </div>
      </div>

      {/* BUILDER TAB */}
      {activeTab === 'builder' && (
        <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
          
          {/* Sidebar Tools */}
          <div className="glass-panel" style={{ width: '280px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>Form Fields</h3>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addField('text', 'Text Input')}>
              <AlignLeft size={18} color="#94a3b8" /> Add Text Field
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addField('email', 'Email Address')}>
              <Mail size={18} color="#94a3b8" /> Add Email Field
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addField('phone', 'Phone Number')}>
              <Phone size={18} color="#94a3b8" /> Add Phone Field
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addField('checkbox', 'Opt-in Checkbox')}>
              <CheckSquare size={18} color="#94a3b8" /> Add Checkbox
            </button>
            
            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <select className="input-field" value={type} onChange={(e) => setType(e.target.value)} style={{ marginBottom: '12px' }}>
                <option>Lead Form</option>
                <option>Newsletter Form</option>
                <option>Registration Form</option>
                <option>Feedback Form</option>
              </select>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Internal Form Title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ marginBottom: '12px' }}
              />
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
                <Save size={18}/> Save Form
              </button>
            </div>
          </div>

          {/* Form Canvas */}
          <div className="glass-panel" style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#f8fafc', color: '#1e293b' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ marginBottom: '8px', textAlign: 'center', color: '#0f172a' }}>{title || 'Untitled Form'}</h2>
              <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>{type}</p>
              
              {fields.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '40px' }}>Add fields from the sidebar.</div>
              ) : (
                fields.map((field) => (
                  <div key={field.id} style={{ 
                    position: 'relative', 
                    marginBottom: '20px', 
                    padding: '16px', 
                    border: '1px dashed #e2e8f0', 
                    borderRadius: '8px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}>
                         <input type="checkbox" checked={field.required} onChange={() => toggleRequired(field.id)} /> Required
                       </label>
                       <button 
                         style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', padding: 0 }}
                         onClick={() => removeField(field.id)}
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>

                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
                      {field.label} {field.required && <span style={{color: '#ef4444'}}>*</span>}
                    </label>
                    
                    {field.type === 'text' || field.type === 'email' || field.type === 'phone' ? (
                      <input type={field.type} disabled placeholder={`Enter ${field.label.toLowerCase()}...`} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }} />
                    ) : field.type === 'checkbox' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <input type="checkbox" disabled /> <span>Check to agree</span>
                      </div>
                    ) : null}
                  </div>
                ))
              )}

              {enableCaptcha && (
                <div style={{ marginTop: '24px', padding: '16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                   <ShieldCheck size={24} color="#10b981" /> I'm not a robot (CAPTCHA Enabled)
                </div>
              )}

              <button style={{ width: '100%', marginTop: '24px', padding: '14px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'not-allowed', opacity: 0.8 }}>
                Submit {type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Validation & Automation
          </h2>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <input 
              type="checkbox" 
              style={{ width: '20px', height: '20px' }}
              checked={enableCaptcha}
              onChange={(e) => setEnableCaptcha(e.target.checked)}
            />
            <div>
              <div style={{ fontWeight: 'bold', color: '#a7f3d0' }}>Enable CAPTCHA Validation</div>
              <div style={{ fontSize: '0.9rem', color: '#6ee7b7' }}>Protect your forms from spam and bot submissions. (Simulation Mode)</div>
            </div>
          </div>

          <h3 style={{ color: '#e2e8f0', marginTop: '40px', marginBottom: '16px' }}>Workflow Automation</h3>
          
          <div className="form-group">
            <label>Email Notifications</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. sales@company.com, admin@company.com" 
              value={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.value)}
            />
            <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>Comma separated emails to notify upon new submissions.</small>
          </div>

          <div className="form-group">
            <label>Webhook URL (POST)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://your-server.com/webhook" 
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>Send raw JSON payload to this URL whenever the form is submitted.</small>
          </div>

          <button className="btn-primary" style={{ marginTop: '24px' }} onClick={handleSave}>
             <Save size={18} /> Save Settings
          </button>
        </div>
      )}

      {/* EMBED TAB */}
      {activeTab === 'embed' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Publish & Embed
          </h2>
          
          {!formId ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              Please design and Save your form in the Builder tab before generating embed codes.
            </div>
          ) : (
            <>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '24px' }}>
                <h3 style={{ color: '#93c5fd', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18}/> HTML Embed Code</h3>
                <p style={{ color: '#bfdbfe', fontSize: '0.9rem', marginBottom: '16px' }}>Copy and paste this snippet anywhere into your website's HTML where you want the form to appear.</p>
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b', position: 'relative' }}>
                  <code style={{ color: '#34d399', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    &lt;iframe src="https://yourcrm.com/forms/public/{formId}" width="100%" height="600px" frameborder="0"&gt;&lt;/iframe&gt;
                  </code>
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                 <h3 style={{ color: '#fcd34d', marginBottom: '12px' }}>API Endpoint (Headless Forms)</h3>
                 <p style={{ color: '#fde68a', fontSize: '0.9rem', marginBottom: '16px' }}>If you are building your own UI, you can POST directly to this endpoint.</p>
                 <code style={{ display: 'block', background: '#0f172a', padding: '12px', borderRadius: '6px', color: '#f87171' }}>
                   POST /api/forms/public/submit/{formId}
                 </code>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
