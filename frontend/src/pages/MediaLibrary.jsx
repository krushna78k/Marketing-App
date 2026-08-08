import { useState, useEffect } from 'react';
import { Upload, File, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { getFiles, uploadFile, deleteFile } from '../services/fileService';

const MediaLibrary = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file);
      fetchFiles(); // Refresh list after upload
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this file?')) return;
    try {
      await deleteFile(id);
      setFiles(files.filter(f => f._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete file.');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="page-header" style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1>Media Library & Asset Manager</h1>
          <p>Securely upload, store, and manage your marketing assets (Images, Documents).</p>
        </div>
        <div>
          <input 
            type="file" 
            id="file-upload" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: uploading ? 0.7 : 1 }}>
            <Upload size={18} /> {uploading ? 'Uploading to Server...' : 'Upload File'}
          </label>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {loading ? (
          <div className="loading-state">Loading assets...</div>
        ) : files.length === 0 ? (
          <div className="empty-state">No files uploaded yet. Securely upload your first asset above.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {files.map(file => (
              <div key={file._id} style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.02)',
                position: 'relative',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <button 
                  onClick={() => handleDelete(file._id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex' }}
                  title="Delete File Permanently"
                >
                  <Trash2 size={16} />
                </button>

                <div style={{ margin: '24px 0 16px 0', color: '#6366f1', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  {file.mimetype.startsWith('image/') ? (
                    <div style={{ backgroundImage: `url(${file.url})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '100%', borderRadius: '8px' }}></div>
                  ) : (
                    <File size={48} color="#94a3b8" />
                  )}
                </div>

                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }} title={file.originalName}>
                    {file.originalName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <span className="badge badge-outline">{file.mimetype.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                    <span>{formatSize(file.size)}</span>
                  </div>
                  
                  <a href={file.url} download target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Download size={14} /> Download
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;
