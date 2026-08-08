import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Play, Pause } from 'lucide-react';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../services/campaignService';
import './CampaignList.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const initialAudience = {
    location: '', ageRange: '', gender: '', customerType: '', purchaseHistory: '', campaignEngagement: '', interests: '', tags: '', customFilters: ''
  };

  const [formData, setFormData] = useState({
    title: '', description: '', notes: '', type: 'Email', status: 'Draft', budget: 0, startDate: '', endDate: '', objective: 'Lead Generation', attachments: [],
    audience: { ...initialAudience }
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAudienceChange = (e) => {
    setFormData({
      ...formData,
      audience: {
        ...formData.audience,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const token = localStorage.getItem('token');
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    setUploading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/files/upload`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({
          ...formData,
          attachments: [...formData.attachments, { fileName: file.name, fileUrl: data.url }]
        });
      } else {
        alert(data.msg || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading file', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset file input
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const openModal = (campaign = null) => {
    if (campaign) {
      // Helper to safely join arrays to strings for editing
      const safeJoin = (val) => Array.isArray(val) ? val.join(', ') : (val || '');

      setFormData({
        title: campaign.title,
        description: campaign.description || '',
        notes: campaign.notes || '',
        type: campaign.type,
        status: campaign.status,
        budget: campaign.budget || 0,
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
        objective: campaign.objective || 'Lead Generation',
        attachments: campaign.attachments || [],
        audience: {
          location: safeJoin(campaign.audience?.location),
          ageRange: campaign.audience?.ageRange || '',
          gender: campaign.audience?.gender || '',
          customerType: safeJoin(campaign.audience?.customerType),
          purchaseHistory: campaign.audience?.purchaseHistory || '',
          campaignEngagement: campaign.audience?.campaignEngagement || '',
          interests: safeJoin(campaign.audience?.interests),
          tags: safeJoin(campaign.audience?.tags),
          customFilters: campaign.audience?.customFilters || ''
        }
      });
      setEditingId(campaign._id);
    } else {
      setFormData({ 
        title: '', description: '', notes: '', type: 'Email', status: 'Draft', budget: 0, startDate: '', endDate: '', objective: 'Lead Generation', attachments: [],
        audience: { ...initialAudience }
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.budget === '') {
        dataToSubmit.budget = 0;
      } else {
        dataToSubmit.budget = Number(dataToSubmit.budget);
      }
      
      // Clear empty dates so backend doesn't complain about invalid strings
      if (!dataToSubmit.startDate) delete dataToSubmit.startDate;
      if (!dataToSubmit.endDate) delete dataToSubmit.endDate;

      // Convert comma separated strings back to arrays
      const splitClean = (str) => typeof str === 'string' && str.trim() ? str.split(',').map(s => s.trim()) : [];
      
      dataToSubmit.audience = {
        ...dataToSubmit.audience,
        location: splitClean(dataToSubmit.audience.location),
        customerType: splitClean(dataToSubmit.audience.customerType),
        interests: splitClean(dataToSubmit.audience.interests),
        tags: splitClean(dataToSubmit.audience.tags)
      };

      if (editingId) {
        await updateCampaign(editingId, dataToSubmit);
      } else {
        await createCampaign(dataToSubmit);
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      console.error('Error saving campaign', err);
      alert('Error saving campaign: Please check your inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        fetchCampaigns();
      } catch (err) {
        console.error('Error deleting campaign', err);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateCampaign(id, { status: newStatus });
      fetchCampaigns();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'badge-success',
      'Draft': 'badge-warning',
      'Paused': 'badge-error',
      'Completed': 'badge-info'
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Campaigns</h1>
          <p>Manage your marketing campaigns across all channels.</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="card table-container" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', width: '300px' }}>
            <Search size={16} className="text-muted" />
            <input type="text" placeholder="Search campaigns..." className="input-field" style={{ border: 'none', background: 'transparent', padding: 0 }} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: '60px' }}>Loading campaigns...</div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <div className="empty-state-icon">
                        <Search size={32} />
                      </div>
                      No campaigns found. Create one to get started!
                    </td>
                  </tr>
              ) : (
                campaigns.map(camp => (
                  <tr key={camp._id}>
                    <td>
                      <div className="font-medium">{camp.title}</div>
                      <div className="text-sm text-muted">{camp.description}</div>
                    </td>
                    <td>{camp.type}</td>
                    <td>{getStatusBadge(camp.status)}</td>
                    <td>${camp.budget?.toLocaleString()}</td>
                    <td className="actions-cell">
                      {camp.status !== 'Active' && (
                        <button className="action-btn text-success" title="Resume Campaign" onClick={() => handleStatusChange(camp._id, 'Active')}>
                          <Play size={16} />
                        </button>
                      )}
                      {camp.status === 'Active' && (
                        <button className="action-btn text-warning" title="Pause Campaign" onClick={() => handleStatusChange(camp._id, 'Paused')}>
                          <Pause size={16} />
                        </button>
                      )}
                      <button className="action-btn edit" onClick={() => openModal(camp)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(camp._id)}>
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
          <div className="modal-content" style={{ maxWidth: '850px', margin: '40px auto' }}>
            <h2>{editingId ? 'Edit Campaign' : 'Create Campaign'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                
                {/* Left Column: Basic Details */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Campaign Details</h3>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" name="title" className="input-field" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" className="input-field" value={formData.description} onChange={handleInputChange} rows="2"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Internal Notes</label>
                    <textarea name="notes" className="input-field" value={formData.notes} onChange={handleInputChange} rows="2" placeholder="Internal campaign notes..."></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Type</label>
                      <select name="type" className="input-field" value={formData.type} onChange={handleInputChange}>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                    <div className="form-group half">
                      <label>Status</label>
                      <select name="status" className="input-field" value={formData.status} onChange={handleInputChange}>
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Budget ($)</label>
                      <input type="number" name="budget" className="input-field" value={formData.budget} onChange={handleInputChange} min="0" />
                    </div>
                    <div className="form-group half">
                      <label>Objective</label>
                      <select name="objective" className="input-field" value={formData.objective} onChange={handleInputChange}>
                        <option value="Lead Generation">Lead Generation</option>
                        <option value="Brand Awareness">Brand Awareness</option>
                        <option value="Sales">Sales</option>
                        <option value="Traffic">Traffic</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Start Date</label>
                      <input type="date" name="startDate" className="input-field" value={formData.startDate} onChange={handleInputChange} />
                    </div>
                    <div className="form-group half">
                      <label>End Date</label>
                      <input type="date" name="endDate" className="input-field" value={formData.endDate} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Attachments</label>
                    <input type="file" className="input-field" onChange={handleFileUpload} disabled={uploading} style={{ padding: '8px' }} />
                    {uploading && <small>Uploading...</small>}
                    {formData.attachments.length > 0 && (
                      <ul style={{ marginTop: '8px', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                        {formData.attachments.map((att, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                            <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-primary">{att.fileName}</a>
                            <span style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }} onClick={() => removeAttachment(idx)}>✕</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Right Column: Audience Segmentation */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#34d399', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Audience Segmentation</h3>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Age Range</label>
                      <select name="ageRange" className="input-field" value={formData.audience.ageRange} onChange={handleAudienceChange}>
                        <option value="">Any Age</option>
                        <option value="18-24">18 - 24</option>
                        <option value="25-34">25 - 34</option>
                        <option value="35-44">35 - 44</option>
                        <option value="45-54">45 - 54</option>
                        <option value="55+">55+</option>
                      </select>
                    </div>
                    <div className="form-group half">
                      <label>Gender</label>
                      <select name="gender" className="input-field" value={formData.audience.gender} onChange={handleAudienceChange}>
                        <option value="">Any Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Locations (comma separated)</label>
                    <input type="text" name="location" className="input-field" value={formData.audience.location} onChange={handleAudienceChange} placeholder="e.g., New York, London, Tokyo" />
                  </div>

                  <div className="form-group">
                    <label>Customer Types (comma separated)</label>
                    <input type="text" name="customerType" className="input-field" value={formData.audience.customerType} onChange={handleAudienceChange} placeholder="e.g., New, Returning, VIP" />
                  </div>

                  <div className="form-group">
                    <label>Purchase History</label>
                    <select name="purchaseHistory" className="input-field" value={formData.audience.purchaseHistory} onChange={handleAudienceChange}>
                      <option value="">None</option>
                      <option value="Has Purchased">Has Purchased</option>
                      <option value="Never Purchased">Never Purchased</option>
                      <option value="Abandoned Cart">Abandoned Cart</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Campaign Engagement</label>
                    <select name="campaignEngagement" className="input-field" value={formData.audience.campaignEngagement} onChange={handleAudienceChange}>
                      <option value="">Any</option>
                      <option value="Highly Engaged">Highly Engaged (Clicked)</option>
                      <option value="Opened">Opened Previous</option>
                      <option value="Did Not Open">Did Not Open</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Interests (comma separated)</label>
                    <input type="text" name="interests" className="input-field" value={formData.audience.interests} onChange={handleAudienceChange} placeholder="e.g., Tech, Fashion, Sports" />
                  </div>

                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" name="tags" className="input-field" value={formData.audience.tags} onChange={handleAudienceChange} placeholder="e.g., B2B, enterprise, summer_promo" />
                  </div>

                  <div className="form-group">
                    <label>Custom Filters (Logic/Queries)</label>
                    <input type="text" name="customFilters" className="input-field" value={formData.audience.customFilters} onChange={handleAudienceChange} placeholder="e.g., last_login > 30d" />
                  </div>
                </div>

              </div>
              <div className="modal-actions" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;
