import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

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

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Upload and manage your study documents</p>
      </div>

      {/* Upload Zone */}
      <Card 
        className={`border-2 border-dashed transition-all duration-200 ${
          dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        } ${uploading ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Uploading document...</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-1">Drop a PDF here or click to browse</p>
              <p className="text-sm text-muted-foreground">Max 20MB • PDF files only</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Document Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </CardHeader>
                <CardFooter>
                  <div className="h-5 bg-muted rounded w-1/4" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-card/50">
            <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No documents yet</h3>
            <p className="text-muted-foreground mt-1">Upload a PDF to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="group hover:shadow-md transition-shadow relative overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-start space-x-3 truncate pr-8">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col truncate">
                      <CardTitle className="text-base truncate" title={doc.filename}>
                        {doc.filename}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center space-x-2 text-xs">
                        {doc.page_count > 0 && (
                          <span>{doc.page_count} page{doc.page_count !== 1 ? 's' : ''}</span>
                        )}
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Badge 
                    variant={doc.status === 'ready' ? 'default' : doc.status === 'failed' ? 'destructive' : 'secondary'}
                    className={`flex items-center gap-1.5 capitalize ${doc.status === 'ready' ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20' : ''}`}
                  >
                    {doc.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {doc.status === 'ready' && <CheckCircle2 className="h-3 w-3" />}
                    {doc.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                    {doc.status}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
