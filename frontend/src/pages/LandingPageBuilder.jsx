import { useState, useEffect } from 'react';
import { Layout, Settings, BarChart2, Save, Globe, Type, Image as ImageIcon, Plus, Trash2, CheckCircle } from 'lucide-react';
// Reusing premium tab styles
import './EmailBuilder.css'; 

const LandingPageBuilder = () => {
  const [activeTab, setActiveTab] = useState('designer'); // 'designer', 'settings', 'analytics'
  const [pageId, setPageId] = useState(null);
  
  // Designer States
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  
  // Settings States
  const [domain, setDomain] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Analytics State
  const [analytics, setAnalytics] = useState({ views: 0, uniqueVisitors: 0, formSubmissions: 0 });

  const token = localStorage.getItem('token');

  const addBlock = (type) => {
    const defaultContent = type === 'hero' ? { heading: 'Amazing Product', subtext: 'Sign up today' } : 
                           type === 'text' ? { text: 'Write your content here...' } : 
                           type === 'form' ? { buttonText: 'Submit' } : {};
    
    setBlocks([...blocks, { id: Date.now().toString(), type, content: defaultContent }]);
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleSave = async (status) => {
    if (!title) return alert('Please enter an internal Page Title first.');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          pageId,
          title,
          blocks,
          domain: domain || undefined,
          seo: { metaTitle, metaDescription, keywords },
          status
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPageId(data._id);
        alert(`Landing Page ${status === 'Published' ? 'Published successfully!' : 'saved as draft!'}`);
        if (status === 'Published') fetchAnalytics(data._id);
      } else {
        const error = await res.json();
        alert(error.msg || 'Save failed');
      }
    } catch (err) {
      alert('Failed to save page');
    }
  };

  const fetchAnalytics = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pages/${id}/analytics`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics');
    }
  };

  return (
    <div className="page-content email-builder-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <div className="page-header" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layout size={28} color="#ec4899" /> Landing Page Studio
          </h1>
          <p>Design beautiful, responsive pages. Optimize SEO, map custom domains, and capture leads natively.</p>
        </div>
        
        <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px' }}>
          <button className={`tab-btn ${activeTab === 'designer' ? 'active' : ''}`} onClick={() => setActiveTab('designer')}>
            <Layout size={16} /> Block Builder
          </button>
          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={16} /> SEO & Domains
          </button>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={16} /> Analytics
          </button>
        </div>
      </div>

      {/* DESIGNER TAB */}
      {activeTab === 'designer' && (
        <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
          
          {/* Tools Sidebar */}
          <div className="glass-panel" style={{ width: '280px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>Components</h3>
            
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addBlock('hero')}>
              <Layout size={18} color="#94a3b8" /> Add Hero Section
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addBlock('text')}>
              <Type size={18} color="#94a3b8" /> Add Text Block
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addBlock('form')}>
              <Plus size={18} color="#94a3b8" /> Add Lead Capture Form
            </button>

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Internal Page Title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ marginBottom: '12px' }}
              />
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }} onClick={() => handleSave('Draft')}>
                <Save size={18}/> Save Draft
              </button>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#ec4899' }} onClick={() => handleSave('Published')}>
                <Globe size={18}/> Publish Page
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="glass-panel" style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: '#f1f5f9', color: '#1e293b' }}>
            {blocks.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <Layout size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <div>Your page is empty. Click a component on the left to start building!</div>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {blocks.map((block) => (
                  <div key={block.id} style={{ 
                    border: '1px dashed #cbd5e1', 
                    padding: '24px', 
                    borderRadius: '12px',
                    position: 'relative',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <span style={{ fontWeight: '600', textTransform: 'uppercase', color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                        {block.type} Block
                      </span>
                      <button 
                        style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => removeBlock(block.id)}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>

                    {block.type === 'hero' && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', color: 'white', borderRadius: '8px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', margin: 0 }}>{block.content.heading}</h2>
                        <p style={{ fontSize: '1.2rem', margin: 0, opacity: 0.9 }}>{block.content.subtext}</p>
                      </div>
                    )}
                    
                    {block.type === 'text' && (
                      <div style={{ fontSize: '1.1rem', color: '#334155', lineHeight: '1.6' }}>
                        {block.content.text}
                      </div>
                    )}

                    {block.type === 'form' && (
                      <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginBottom: '16px', color: '#0f172a' }}>Lead Capture Form</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <input type="text" placeholder="Name" disabled style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <input type="email" placeholder="Email" disabled style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <button disabled style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                            {block.content.buttonText}
                          </button>
                        </div>
                        <small style={{ display: 'block', marginTop: '12px', color: '#64748b' }}>
                          * Submissions to this form will automatically be added to your Lead Management page!
                        </small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Domain & SEO Configuration
          </h2>
          
          <div className="form-group">
            <label>Custom Domain (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. promo.yourcompany.com" 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>Map a custom URL directly to this landing page.</small>
          </div>

          <h3 style={{ color: '#e2e8f0', marginTop: '32px', marginBottom: '16px' }}>Search Engine Optimization (SEO)</h3>
          
          <div className="form-group">
            <label>Meta Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Title for Google Search results" 
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Meta Description</label>
            <textarea 
              className="input-field" 
              rows="3"
              placeholder="A brief description of this page for search engines..." 
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Keywords</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. marketing, software, crm" 
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <CheckCircle color="#34d399" />
             <span style={{ color: '#d1fae5' }}>Save or Publish the page in the Designer tab to apply these settings.</span>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="glass-panel" style={{ padding: '32px', flex: 1 }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc' }}>Landing Page Performance</h2>
          
          {!pageId ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              Please save and publish a page first to view its analytics.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              
              <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '8px' }}>Total Views</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa' }}>{analytics.views}</div>
              </div>
              
              <div className="stat-card" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ color: '#c4b5fd', fontSize: '0.9rem', marginBottom: '8px' }}>Unique Visitors</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a78bfa' }}>{analytics.uniqueVisitors}</div>
              </div>
              
              <div className="stat-card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ color: '#a7f3d0', fontSize: '0.9rem', marginBottom: '8px' }}>Form Submissions (Leads)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#34d399' }}>{analytics.formSubmissions}</div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandingPageBuilder;
