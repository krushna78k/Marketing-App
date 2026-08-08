import { useState, useEffect } from 'react';
import { GitCommit, Play, Clock, Mail, MessageSquare, Save, Settings, Activity, Trash2, UserPlus } from 'lucide-react';
// Reusing premium tab styles
import './EmailBuilder.css'; 

const WorkflowAutomation = () => {
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas', 'settings', 'executions'
  const [workflowId, setWorkflowId] = useState(null);
  
  // Workflow States
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('New Lead');
  const [nodes, setNodes] = useState([]);
  const [status, setStatus] = useState('Draft');
  
  // Executions State
  const [executions, setExecutions] = useState([]);
  const [testLeadId, setTestLeadId] = useState(''); // For manual trigger testing

  const token = localStorage.getItem('token');

  const addNode = (type, label) => {
    setNodes([...nodes, { id: Date.now().toString(), type, label, config: {} }]);
  };

  const removeNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const handleSave = async (newStatus) => {
    if (!name) return alert('Please enter a Workflow Name.');
    if (nodes.length === 0) return alert('Please add at least one action node.');

    try {
      const res = await fetch('http://localhost:5000/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          workflowId,
          name,
          trigger,
          nodes,
          status: newStatus || status
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setWorkflowId(data._id);
        setStatus(data.status);
        alert(`Workflow ${data.status} successfully!`);
      } else {
        alert('Save failed');
      }
    } catch (err) {
      alert('Failed to save workflow');
    }
  };

  const fetchExecutions = async () => {
    if (!workflowId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/workflows/${workflowId}/executions`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
      }
    } catch (err) {
      console.error('Error fetching executions');
    }
  };

  const handleManualTrigger = async () => {
    if (!testLeadId) return alert('Please enter a Lead ID to test with.');
    if (status !== 'Active') return alert('Workflow must be saved as Active before testing.');

    try {
      const res = await fetch(`http://localhost:5000/api/workflows/${workflowId}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ leadId: testLeadId })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`Engine Simulation: ${data.msg}`);
        fetchExecutions();
      } else {
        alert(`Simulation Error: ${data.msg}`);
      }
    } catch (err) {
      alert('Simulation Failed');
    }
  };

  const getNodeIcon = (type) => {
    switch(type) {
      case 'delay': return <Clock size={20} color="#f59e0b" />;
      case 'email': return <Mail size={20} color="#3b82f6" />;
      case 'sms': return <MessageSquare size={20} color="#10b981" />;
      case 'whatsapp': return <MessageSquare size={20} color="#25D366" />;
      case 'assignment': return <UserPlus size={20} color="#ec4899" />;
      default: return <GitCommit size={20} />;
    }
  };

  return (
    <div className="page-content email-builder-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <div className="page-header" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCommit size={28} color="#8b5cf6" /> Marketing Automation
          </h1>
          <p>Build powerful trigger-based workflows to automate Emails, SMS, and Lead Assignments.</p>
        </div>
        
        <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px' }}>
          <button className={`tab-btn ${activeTab === 'canvas' ? 'active' : ''}`} onClick={() => setActiveTab('canvas')}>
            <GitCommit size={16} /> Canvas Builder
          </button>
          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={16} /> Trigger Settings
          </button>
          <button className={`tab-btn ${activeTab === 'executions' ? 'active' : ''}`} onClick={() => { setActiveTab('executions'); fetchExecutions(); }}>
            <Activity size={16} /> Execution Logs
          </button>
        </div>
      </div>

      {/* CANVAS TAB */}
      {activeTab === 'canvas' && (
        <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
          
          {/* Sidebar Tools */}
          <div className="glass-panel" style={{ width: '280px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>Actions</h3>
            
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addNode('delay', 'Time Delay')}>
              {getNodeIcon('delay')} Add Delay
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addNode('email', 'Send Automated Email')}>
              {getNodeIcon('email')} Send Email
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addNode('sms', 'Send Automated SMS')}>
              {getNodeIcon('sms')} Send SMS
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addNode('whatsapp', 'Send WhatsApp Message')}>
              {getNodeIcon('whatsapp')} Send WhatsApp
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => addNode('assignment', 'Update Lead Status / Assign')}>
              {getNodeIcon('assignment')} Update / Assign
            </button>
            
            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }} onClick={() => handleSave('Draft')}>
                <Save size={18}/> Save Draft
              </button>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#8b5cf6' }} onClick={() => handleSave('Active')}>
                <Play size={18}/> Activate Automation
              </button>
            </div>
          </div>

          {/* Canvas View */}
          <div className="glass-panel" style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#f1f5f9', color: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ background: '#8b5cf6', color: 'white', padding: '16px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <Play size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Trigger</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>When: {trigger}</div>
              </div>
            </div>

            <div style={{ height: '40px', width: '2px', background: '#cbd5e1' }}></div>

            {nodes.length === 0 ? (
              <div style={{ padding: '24px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#94a3b8' }}>
                Add actions from the sidebar to build your sequence.
              </div>
            ) : (
              nodes.map((node, index) => (
                <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{ 
                    background: 'white', 
                    border: '1px solid #e2e8f0', 
                    padding: '20px 24px', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '350px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        {getNodeIcon(node.type)}
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#334155' }}>{node.label}</div>
                    </div>
                    
                    <button 
                      style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px' }}
                      onClick={() => removeNode(node.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {index < nodes.length - 1 && (
                    <div style={{ height: '40px', width: '2px', background: '#cbd5e1' }}></div>
                  )}
                </div>
              ))
            )}

            {nodes.length > 0 && (
              <>
                <div style={{ height: '40px', width: '2px', background: '#cbd5e1' }}></div>
                <div style={{ background: '#f1f5f9', border: '2px dashed #cbd5e1', color: '#94a3b8', padding: '12px 32px', borderRadius: '24px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  End of Workflow
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Workflow Configuration
          </h2>
          
          <div className="form-group">
            <label>Automation Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Welcome Series for New Signups" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Workflow Trigger</label>
            <select className="input-field" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
              <option value="New Lead">When a New Lead is created</option>
              <option value="Form Submission">When a Lead Form is submitted</option>
              <option value="Status Update">When a Lead Status changes</option>
              <option value="Manual Trigger">Manual Trigger Only</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8' }}>Current Status:</span>
            <span style={{ 
              background: status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
              color: status === 'Active' ? '#34d399' : '#e2e8f0', 
              padding: '6px 16px', borderRadius: '16px', fontWeight: 'bold' 
            }}>
              {status}
            </span>
          </div>
        </div>
      )}

      {/* EXECUTIONS TAB */}
      {activeTab === 'executions' && (
        <div className="glass-panel" style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <h2 style={{ marginBottom: '24px', color: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
            Execution Logs & Engine Simulation
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter Lead ID to Test..." 
                value={testLeadId}
                onChange={(e) => setTestLeadId(e.target.value)}
                style={{ width: '250px', padding: '8px' }}
              />
              <button className="btn-primary" onClick={handleManualTrigger} style={{ background: '#f59e0b' }}>
                <Play size={16} /> Test Engine
              </button>
            </div>
          </h2>
          
          {!workflowId ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              Please save the workflow first.
            </div>
          ) : executions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              No executions found. Enter a Lead ID above and click "Test Engine" to simulate a run!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {executions.map(exec => (
                <div key={exec._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>Lead: {exec.leadId?.name || exec.leadId}</div>
                    <div style={{ 
                      color: exec.status === 'Completed' ? '#34d399' : exec.status === 'Failed' ? '#f87171' : '#fbbf24',
                      fontWeight: 'bold'
                    }}>
                      Status: {exec.status}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exec.logs.map((log, i) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748b', minWidth: '150px' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span style={{ color: '#8b5cf6', fontWeight: 'bold', minWidth: '100px' }}>[{log.actionType}]</span>
                        <span style={{ color: log.actionType === 'Error' ? '#f87171' : '#cbd5e1' }}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;
