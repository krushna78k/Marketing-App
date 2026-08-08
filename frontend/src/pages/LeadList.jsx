import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Mail, Phone, Building, Download, Calendar, User, Activity, DollarSign } from 'lucide-react';
import { getLeads, createLead, updateLead, deleteLead, convertLead, addNote } from '../services/leadService';
import { getCampaigns } from '../services/campaignService';
import { getUsers } from '../services/userService';
import { format } from 'date-fns';
import './LeadList.css';

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const initialFormState = {
    name: '', email: '', phone: '', company: '', designation: '', industry: '', 
    source: 'Manual Entry', status: 'New', campaignId: '', assignedTo: '', 
    followUpDate: '', notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsData, campaignsData, usersData] = await Promise.all([
        getLeads(),
        getCampaigns(),
        getUsers()
      ]);
      setLeads(leadsData);
      setCampaigns(campaignsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (lead = null) => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company || '',
        designation: lead.designation || '',
        industry: lead.industry || '',
        source: lead.source,
        status: lead.status,
        campaignId: lead.campaignId?._id || '',
        assignedTo: lead.assignedTo?._id || '',
        followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '',
        notes: lead.notes || ''
      });
      setEditingLead(lead);
    } else {
      setFormData(initialFormState);
      setEditingLead(null);
    }
    setNewNote('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.campaignId) delete dataToSubmit.campaignId;
      if (!dataToSubmit.assignedTo) delete dataToSubmit.assignedTo;
      if (!dataToSubmit.followUpDate) delete dataToSubmit.followUpDate;

      if (editingLead) {
        await updateLead(editingLead._id, dataToSubmit);
      } else {
        await createLead(dataToSubmit);
      }
      setShowModal(false);
      fetchData(); // Refresh leads
    } catch (err) {
      console.error('Error saving lead', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting lead', err);
      }
    }
  };

  const handleConvertLead = async (id) => {
    const dealValue = prompt('Enter the estimated Deal Value ($) to convert this lead:', '1000');
    if (dealValue !== null) {
      try {
        await convertLead(id, Number(dealValue));
        alert('Lead successfully converted to a Deal!');
        fetchData();
      } catch (err) {
        console.error('Error converting lead', err);
        alert('Failed to convert lead');
      }
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !editingLead) return;
    try {
      const updatedLead = await addNote(editingLead._id, newNote);
      setEditingLead(updatedLead);
      setNewNote('');
      fetchData(); // Refresh background list
    } catch (err) {
      console.error('Error adding note', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'New': 'badge-info',
      'Contacted': 'badge-warning',
      'Qualified': 'badge-primary',
      'Proposal Sent': 'badge-purple',
      'Won': 'badge-success',
      'Lost': 'badge-error'
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Assigned To', 'Follow Up'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.name, 
        lead.email, 
        lead.phone || '', 
        lead.company || '', 
        lead.source, 
        lead.status, 
        lead.assignedTo?.name || '',
        lead.followUpDate ? format(new Date(lead.followUpDate), 'yyyy-MM-dd') : ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content lead-page-wrapper">
      <div className="page-header">
        <div>
          <h1>Lead Management</h1>
          <p>Manage your prospects and track their journey.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> Add Lead
          </button>
        </div>
      </div>

      <div className="card table-container">
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={16} className="text-muted" />
            <input type="text" placeholder="Search leads..." className="input-field" style={{ border: 'none', background: 'transparent', padding: 0 }} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: '60px' }}>Loading leads...</div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lead Info</th>
                  <th>Contact</th>
                  <th>Status & Tracking</th>
                  <th>Source / Campaign</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="empty-state-icon-leads">
                        <User size={40} />
                      </div>
                      No leads found. Add one to get started!
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead._id}>
                    <td>
                      <div className="font-medium">{lead.name}</div>
                      {lead.designation && lead.company && (
                        <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Building size={12} /> {lead.designation} at {lead.company}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Mail size={14} className="text-muted" /> {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} className="text-muted" /> {lead.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      {getStatusBadge(lead.status)}
                      <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                        <User size={12} /> {lead.assignedTo?.name || 'Unassigned'}
                      </div>
                      {lead.followUpDate && (
                        <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#c084fc' }}>
                          <Calendar size={12} /> Follow-up: {format(new Date(lead.followUpDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-sm">{lead.source}</div>
                      {lead.campaignId && (
                        <div className="badge badge-outline mt-1">{lead.campaignId.title}</div>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn" title="Convert to Deal" onClick={() => handleConvertLead(lead._id)} style={{ color: '#10b981' }}>
                        <DollarSign size={16} />
                      </button>
                      <button className="action-btn edit" onClick={() => openModal(lead)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(lead._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ overflowY: 'auto' }}>
          <div className="modal-content lead-modal-content" style={{ maxWidth: '800px', margin: '40px auto' }}>
            <h2>{editingLead ? 'Edit Lead' : 'Add Lead'}</h2>
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'grid', gridTemplateColumns: editingLead ? '2fr 1fr' : '1fr', gap: '24px' }}>
                {/* Main Form Area */}
                <div>
                  <h3 className="form-section-title">Lead Details</h3>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Full Name</label>
                      <input type="text" name="name" className="input-field" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group half">
                      <label>Email Address</label>
                      <input type="email" name="email" className="input-field" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Phone Number</label>
                      <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="form-group half">
                      <label>Company</label>
                      <input type="text" name="company" className="input-field" value={formData.company} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Designation / Title</label>
                      <input type="text" name="designation" className="input-field" value={formData.designation} onChange={handleInputChange} />
                    </div>
                    <div className="form-group half">
                      <label>Industry</label>
                      <input type="text" name="industry" className="input-field" value={formData.industry} onChange={handleInputChange} />
                    </div>
                  </div>

                  <h3 className="form-section-title">Tracking & Assignment</h3>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Status</label>
                      <select name="status" className="input-field" value={formData.status} onChange={handleInputChange}>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                    <div className="form-group half">
                      <label>Assigned To</label>
                      <select name="assignedTo" className="input-field" value={formData.assignedTo} onChange={handleInputChange}>
                        <option value="">-- Select Rep --</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Source</label>
                      <select name="source" className="input-field" value={formData.source} onChange={handleInputChange}>
                        <option value="Manual Entry">Manual Entry</option>
                        <option value="Website Form">Website Form</option>
                        <option value="Referral">Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Event">Event</option>
                      </select>
                    </div>
                    <div className="form-group half">
                      <label>Linked Campaign</label>
                      <select name="campaignId" className="input-field" value={formData.campaignId} onChange={handleInputChange}>
                        <option value="">-- No Campaign --</option>
                        {campaigns.map(camp => (
                          <option key={camp._id} value={camp._id}>{camp.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Follow-up Date</label>
                      <input type="date" name="followUpDate" className="input-field" value={formData.followUpDate} onChange={handleInputChange} />
                    </div>
                    <div className="form-group half">
                      <label>Internal Notes</label>
                      <textarea name="notes" className="input-field" value={formData.notes} onChange={handleInputChange} rows="2" placeholder="Add some notes..."></textarea>
                    </div>
                  </div>
                </div>

                {/* Sidebar Area for Timeline (only visible when editing) */}
                {editingLead && (
                  <div style={{ background: '#0f172a', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="form-section-title" style={{ marginTop: 0 }}>
                      Activity Timeline
                    </h3>
                    
                    {editingLead.activityTimeline && editingLead.activityTimeline.length > 0 ? (
                      <div>
                        {/* Reverse to show newest first */}
                        {[...editingLead.activityTimeline].reverse().map((event, idx) => (
                          <div key={idx} className="timeline-event">
                            <div className="timeline-event-action">{event.action}</div>
                            <div className="timeline-event-date">
                              {new Date(event.date).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted text-sm">No activity recorded yet.</div>
                    )}
                    
                    <h3 className="form-section-title" style={{ marginTop: '32px' }}>
                      Customer Notes
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {editingLead.customerNotes && editingLead.customerNotes.length > 0 ? (
                        [...editingLead.customerNotes].reverse().map((note, idx) => (
                          <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
                              {new Date(note.date).toLocaleString()}
                            </div>
                            <div style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{note.content}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted text-sm">No notes added yet.</div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Type a new note..." 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(); } }}
                      />
                      <button type="button" className="btn-primary" onClick={handleAddNote}>Add</button>
                    </div>

                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
