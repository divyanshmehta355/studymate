import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await api.get('/documents/');
      setDocuments(res.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    // poll for status updates every 5 seconds if any doc is processing
    const interval = setInterval(() => {
      if (documents.some((d) => d.status === 'processing')) {
        fetchDocs();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDocs, documents]);

  async function handleUpload(file) {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded! Processing...');
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error('Failed to delete document');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleUpload(file);
    e.target.value = '';
  }

  const statusIcon = {
    processing: <Loader2 size={14} className="status-spin" />,
    ready: <CheckCircle2 size={14} />,
    failed: <AlertCircle size={14} />,
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Upload and manage your study documents</p>
      </div>

      {/* upload zone */}
      <div
        className={`upload-zone ${dragOver ? 'upload-zone-active' : ''} ${uploading ? 'upload-zone-uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          hidden
        />
        {uploading ? (
          <>
            <div className="spinner" style={{ width: 28, height: 28 }} />
            <p>Uploading...</p>
          </>
        ) : (
          <>
            <Upload size={32} />
            <p>Drop a PDF here or click to browse</p>
            <span className="upload-hint">Max 20MB • PDF files only</span>
          </>
        )}
      </div>

      {/* document grid */}
      {loading ? (
        <div className="doc-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="doc-card card skeleton-card">
              <div className="skeleton" style={{ height: 20, width: '60%' }} />
              <div className="skeleton" style={{ height: 14, width: '40%', marginTop: 8 }} />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={64} />
          <h3>No documents yet</h3>
          <p>Upload a PDF to get started</p>
        </div>
      ) : (
        <div className="doc-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="doc-card card fade-in">
              <div className="doc-card-header">
                <FileText size={20} className="doc-icon" />
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                  title="Delete document"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 className="doc-name">{doc.filename}</h3>

              <div className="doc-meta">
                {doc.page_count > 0 && (
                  <span>{doc.page_count} page{doc.page_count !== 1 ? 's' : ''}</span>
                )}
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>

              <span className={`badge badge-${doc.status}`}>
                {statusIcon[doc.status]}
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
