import { useState, useContext, useEffect } from 'react';
import { Plus, Edit2, Trash2, User as UserIcon, Mail, Users, Shield, Webhook, Save, Activity } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser, getActivityLogs } from '../services/userService';
import { getIntegrations, updateIntegrations } from '../services/integrationService';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('team');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Viewer' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [integrations, setIntegrations] = useState({
    googleAnalytics: { trackingId: '' },
    googleAds: { developerToken: '', customerId: '' },
    metaAds: { accessToken: '', pixelId: '' },
    whatsappApi: { apiKey: '', phoneNumberId: '' },
    smtpEmail: { host: '', port: '', username: '', password: '' },
    paymentGateway: { stripeSecretKey: '', stripePublicKey: '' },
    crmPlatform: { hubspotApiKey: '', salesforceToken: '' },
    socialMedia: {
      twitter: { apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
      instagram: { accessToken: '', userId: '' },
      facebook: { accessToken: '', pageId: '' }
    }
  });
  const [savingInt, setSavingInt] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const data = await getIntegrations();
      if (data) {
        setIntegrations({
          googleAnalytics: data.googleAnalytics || { trackingId: '' },
          googleAds: data.googleAds || { developerToken: '', customerId: '' },
          metaAds: data.metaAds || { accessToken: '', pixelId: '' },
          whatsappApi: data.whatsappApi || { apiKey: '', phoneNumberId: '' },
          smtpEmail: data.smtpEmail || { host: '', port: '', username: '', password: '' },
          paymentGateway: data.paymentGateway || { stripeSecretKey: '', stripePublicKey: '' },
          crmPlatform: data.crmPlatform || { hubspotApiKey: '', salesforceToken: '' },
          socialMedia: data.socialMedia || {
            twitter: { apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
            instagram: { accessToken: '', userId: '' },
            facebook: { accessToken: '', pageId: '' }
          }
        });
      }
    } catch (err) {
      console.error('Error fetching integrations', err);
    }
  };

  const handleIntegrationChange = (category, field, value) => {
    setIntegrations(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSocialMediaChange = (platform, field, value) => {
    setIntegrations(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: {
          ...prev.socialMedia[platform],
          [field]: value
        }
      }
    }));
  };

  const handleSaveIntegrations = async () => {
    setSavingInt(true);
    try {
      await updateIntegrations(integrations);
      alert('Integration settings saved successfully!');
    } catch (err) {
      console.error('Error saving integrations', err);
      alert('Failed to save integration settings.');
    } finally {
      setSavingInt(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await getActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (u = null) => {
    if (u) {
      setFormData({ name: u.name, email: u.email, password: '', role: u.role });
      setEditingId(u._id);
    } else {
      setFormData({ name: '', email: '', password: '', role: 'Viewer' });
      setEditingId(null);
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (editingId && !dataToSubmit.password) {
        delete dataToSubmit.password; // Don't send empty password on update
      }

      if (editingId) {
        await updateUser(editingId, dataToSubmit);
      } else {
        await createUser(dataToSubmit);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (id === user.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user', err);
      }
    }
  };

  if (user?.role !== 'Super Admin') {
    return (
      <div className="page-content">
        <h2>Access Denied</h2>
        <p>You do not have permission to view Settings.</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Settings & Team Management</h1>
          <p>Manage your organization, team members, and roles.</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button 
          className={`tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <Users size={16}/> Team
        </button>
        <button 
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16}/> Security
        </button>
        <button 
          className={`tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Webhook size={16}/> Integrations
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={16}/> Activity Logs
        </button>
      </div>

      {activeTab === 'team' && (
        <div className="glass-panel table-container">
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
            <button className="btn-primary" onClick={() => openModal()}>
              <Plus size={18} /> Invite User
            </button>
          </div>
          {loading ? (
            <div className="loading-state">Loading team...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserIcon size={16} className="text-muted" /> {u.name}
                      </div>
                      <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <Mail size={14} /> {u.email}
                      </div>
                    </td>
                    <td><span className="badge badge-outline">{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button className="action-btn edit" onClick={() => openModal(u)}>
                        <Edit2 size={16} />
                      </button>
                      {user.id !== u._id && (
                        <button className="action-btn delete" onClick={() => handleDelete(u._id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <h2>{editingId ? 'Edit Team Member' : 'Invite Team Member'}</h2>
            {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" className="input-field" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="input-field" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" className="input-field" value={formData.role} onChange={handleInputChange}>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="form-group">
                <label>{editingId ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input 
                  type="password" 
                  name="password" 
                  className="input-field" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required={!editingId} 
                  minLength="6"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>Google Analytics</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Track website traffic.</p>
            <div className="form-group">
              <label>Tracking ID (e.g., G-XXXXXXX)</label>
              <input type="text" className="input-field" value={integrations.googleAnalytics.trackingId} onChange={(e) => handleIntegrationChange('googleAnalytics', 'trackingId', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>Google Ads</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Sync campaigns and conversions.</p>
            <div className="form-group">
              <label>Developer Token</label>
              <input type="password" className="input-field" value={integrations.googleAds.developerToken} onChange={(e) => handleIntegrationChange('googleAds', 'developerToken', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Customer ID</label>
              <input type="text" className="input-field" value={integrations.googleAds.customerId} onChange={(e) => handleIntegrationChange('googleAds', 'customerId', e.target.value)} />
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>Meta (Facebook) Ads</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Sync leads and audiences.</p>
            <div className="form-group">
              <label>Access Token</label>
              <input type="password" className="input-field" value={integrations.metaAds.accessToken} onChange={(e) => handleIntegrationChange('metaAds', 'accessToken', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pixel ID</label>
              <input type="text" className="input-field" value={integrations.metaAds.pixelId} onChange={(e) => handleIntegrationChange('metaAds', 'pixelId', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>WhatsApp Business API</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Send automated messages.</p>
            <div className="form-group">
              <label>API Key / Token</label>
              <input type="password" className="input-field" value={integrations.whatsappApi.apiKey} onChange={(e) => handleIntegrationChange('whatsappApi', 'apiKey', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone Number ID</label>
              <input type="text" className="input-field" value={integrations.whatsappApi.phoneNumberId} onChange={(e) => handleIntegrationChange('whatsappApi', 'phoneNumberId', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>SMTP Email Service</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Configure custom outbound email routing.</p>
            <div className="form-group">
              <label>Host</label>
              <input type="text" className="input-field" placeholder="smtp.mailgun.org" value={integrations.smtpEmail.host} onChange={(e) => handleIntegrationChange('smtpEmail', 'host', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Port</label>
              <input type="text" className="input-field" placeholder="587" value={integrations.smtpEmail.port} onChange={(e) => handleIntegrationChange('smtpEmail', 'port', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="input-field" value={integrations.smtpEmail.username} onChange={(e) => handleIntegrationChange('smtpEmail', 'username', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="input-field" value={integrations.smtpEmail.password} onChange={(e) => handleIntegrationChange('smtpEmail', 'password', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>Payment Gateways</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Connect Stripe for processing.</p>
            <div className="form-group">
              <label>Stripe Secret Key</label>
              <input type="password" className="input-field" value={integrations.paymentGateway.stripeSecretKey} onChange={(e) => handleIntegrationChange('paymentGateway', 'stripeSecretKey', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Stripe Public Key</label>
              <input type="password" className="input-field" value={integrations.paymentGateway.stripePublicKey} onChange={(e) => handleIntegrationChange('paymentGateway', 'stripePublicKey', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>CRM Platforms</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Sync with Hubspot or Salesforce.</p>
            <div className="form-group">
              <label>Hubspot API Key</label>
              <input type="password" className="input-field" value={integrations.crmPlatform.hubspotApiKey} onChange={(e) => handleIntegrationChange('crmPlatform', 'hubspotApiKey', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Salesforce Access Token</label>
              <input type="password" className="input-field" value={integrations.crmPlatform.salesforceToken} onChange={(e) => handleIntegrationChange('crmPlatform', 'salesforceToken', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>X (Twitter) Developer API</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Allow users to publish to X.</p>
            <div className="form-group">
              <label>API Key</label>
              <input type="password" className="input-field" value={integrations.socialMedia.twitter.apiKey} onChange={(e) => handleSocialMediaChange('twitter', 'apiKey', e.target.value)} />
            </div>
            <div className="form-group">
              <label>API Secret</label>
              <input type="password" className="input-field" value={integrations.socialMedia.twitter.apiSecret} onChange={(e) => handleSocialMediaChange('twitter', 'apiSecret', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Access Token</label>
              <input type="password" className="input-field" value={integrations.socialMedia.twitter.accessToken} onChange={(e) => handleSocialMediaChange('twitter', 'accessToken', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Access Secret</label>
              <input type="password" className="input-field" value={integrations.socialMedia.twitter.accessSecret} onChange={(e) => handleSocialMediaChange('twitter', 'accessSecret', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>Instagram Graph API</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Publish images and videos directly to Instagram feeds.</p>
            <div className="form-group">
              <label>Access Token</label>
              <input type="password" className="input-field" value={integrations.socialMedia.instagram.accessToken} onChange={(e) => handleSocialMediaChange('instagram', 'accessToken', e.target.value)} />
            </div>
            <div className="form-group">
              <label>User ID</label>
              <input type="text" className="input-field" value={integrations.socialMedia.instagram.userId} onChange={(e) => handleSocialMediaChange('instagram', 'userId', e.target.value)} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3>Facebook Pages API</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Publish posts to connected Facebook Pages.</p>
            <div className="form-group">
              <label>Access Token</label>
              <input type="password" className="input-field" value={integrations.socialMedia.facebook.accessToken} onChange={(e) => handleSocialMediaChange('facebook', 'accessToken', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Page ID</label>
              <input type="text" className="input-field" value={integrations.socialMedia.facebook.pageId} onChange={(e) => handleSocialMediaChange('facebook', 'pageId', e.target.value)} />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button className="btn-primary" onClick={handleSaveIntegrations} disabled={savingInt}>
              <Save size={18} /> {savingInt ? 'Saving...' : 'Save Integration Settings'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="glass-panel table-container">
          {loadingLogs ? (
            <div className="loading-state">Loading activity logs...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td className="text-muted text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="font-medium">{log.user?.name || 'Unknown User'}</div>
                      <div className="text-sm text-muted">{log.user?.email}</div>
                    </td>
                    <td><span className="badge badge-outline">{log.action}</span></td>
                    <td className="text-sm">
                      <pre style={{ margin: 0, background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', overflowX: 'auto', maxWidth: '250px' }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td className="text-sm text-muted">{log.ipAddress || 'Unknown'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{ padding: '24px' }}>No activity logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
