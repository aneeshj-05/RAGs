import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowUp, FileText, Home, Loader2, Mic, Paperclip, Search, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type DocumentItem, type SourceMetadata } from '../../services/api';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: SourceMetadata[];
  createdAt: string;
  confidence?: number;
};

type UploadingFile = DocumentItem & {
  size: number;
  progress: number;
  status: 'uploading' | 'indexed' | 'failed';
};

function id() {
  return Math.random().toString(36).slice(2, 10);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function markdownLite(text: string) {
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => line.replace(/\*\*(.*?)\*\*/g, '$1'));
}

export function WorkspacePage() {
  const [online, setOnline] = useState(true);
  const [documents, setDocuments] = useState<UploadingFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: id(),
      role: 'assistant',
      text: 'Upload a PDF or folder of PDFs, then ask a specific question. I will answer only from the indexed context and surface the sources I used.',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 92,
    },
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceMetadata | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.checkHealth().then(setOnline);
    const timer = window.setInterval(() => api.checkHealth().then(setOnline), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const stats = useMemo(() => {
    const chunks = documents.reduce((sum, doc) => sum + doc.chunks, 0);
    const storage = documents.reduce((sum, doc) => sum + doc.size, 0);
    return { chunks, storage: formatSize(storage), ready: documents.filter((doc) => doc.status === 'indexed').length };
  }, [documents]);

  const recentQuestions = useMemo(() => (
    messages
      .filter((message) => message.role === 'user')
      .slice(-5)
      .reverse()
  ), [messages]);

  async function uploadFiles(files: FileList | File[]) {
    const pdfs = Array.from(files).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

    for (const file of pdfs) {
      const localId = id();
      const pending: UploadingFile = {
        id: localId,
        filename: file.name,
        chunks: 0,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        size: file.size,
        progress: 4,
        status: 'uploading',
      };
      setDocuments((prev) => [pending, ...prev]);

      try {
        const response = await api.uploadPdf(file, (progress) => {
          setDocuments((prev) => prev.map((doc) => doc.id === localId ? { ...doc, progress: Math.max(progress, 8) } : doc));
        });

        setDocuments((prev) => prev.map((doc) => doc.id === localId ? {
          ...doc,
          filename: response.filename || file.name,
          chunks: response.chunks,
          progress: 100,
          status: 'indexed',
        } : doc));
      } catch {
        setDocuments((prev) => prev.map((doc) => doc.id === localId ? { ...doc, status: 'failed', progress: 100 } : doc));
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void uploadFiles(event.target.files);
    event.target.value = '';
  }

  async function sendQuestion(event?: FormEvent) {
    event?.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;

    const userMessage: Message = {
      id: id(),
      role: 'user',
      text: cleanQuestion,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await api.askQuestion(cleanQuestion);
      setMessages((prev) => [...prev, {
        id: id(),
        role: 'assistant',
        text: response.answer || 'No answer was generated from the uploaded context.',
        sources: response.sources || [],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: response.sources?.length ? 86 : 54,
      }]);
      if (response.sources?.[0]) setSelectedSource(response.sources[0]);
    } catch (error: any) {
      setMessages((prev) => [...prev, {
        id: id(),
        role: 'assistant',
        text: error.response?.data?.detail || 'DocIntel could not reach the backend. Confirm FastAPI is running on port 8000.',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function deleteDocument(documentId: string) {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  }

  return (
    <div className="workspace-shell">
      <aside className="workspace-left" aria-label="Workspace navigation">
        <Link to="/" className="workspace-logo"><span>DI</span> DocIntel AI</Link>
        <button className="upload-command" onClick={() => fileInputRef.current?.click()}><Upload size={17} /> Upload Documents</button>
        <input ref={fileInputRef} className="sr-only" type="file" accept="application/pdf" multiple onChange={handleFileChange} />
        <input ref={folderInputRef} className="sr-only" type="file" multiple onChange={handleFileChange} {...{ webkitdirectory: '', directory: '' }} />

        <nav className="side-nav" aria-label="Workspace sections">
          <a className="active"><Home size={16} /> Workspace</a>
        </nav>

        <section className="sidebar-section">
          <div className="sidebar-heading">Uploaded documents</div>
          <div className="doc-list compact">
            {documents.length === 0 && <p className="empty-text">No PDFs indexed yet.</p>}
            {documents.slice(0, 6).map((doc) => (
              <div className="doc-row" key={doc.id}>
                <FileText size={15} />
                <span>{doc.filename}</span>
                <button aria-label={`Remove ${doc.filename}`} onClick={() => deleteDocument(doc.id)}><X size={14} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="sidebar-section">
          <div className="sidebar-heading">Recent questions</div>
          <div className="question-list">
            {recentQuestions.length === 0 && <p className="empty-text">Your asked questions will appear here.</p>}
            {recentQuestions.map((item) => (
              <button className="question-chip" key={item.id} onClick={() => setQuestion(item.text)}>
                <Search size={14} />
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="storage-meter" aria-label="Storage usage">
          <div><span>Storage</span><strong>{stats.storage}</strong></div>
          <i><b style={{ width: `${Math.min(100, documents.length * 16)}%` }} /></i>
        </section>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-search"><Search size={17} /><span>Search uploaded documents</span></div>
          <div className={`status-pill ${online ? 'online' : 'offline'}`}>{online ? 'Backend online' : 'Backend offline'}</div>
        </header>

        <section className="conversation" aria-label="Conversation">
          {messages.map((message) => (
            <motion.article className={`message ${message.role}`} key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="message-meta"><span>{message.role === 'user' ? 'You' : 'DocIntel'}</span><time>{message.createdAt}</time></div>
              <div className="message-body">
                {markdownLite(message.text).map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}
              </div>
              {message.role === 'assistant' && (
                <div className="answer-details">
                  {typeof message.confidence === 'number' && <span className="confidence">Confidence {message.confidence}%</span>}
                  {!!message.sources?.length && (
                    <div className="sources-list">
                      {message.sources.map((source, index) => (
                        <button key={`${message.id}-source-${index}`} onClick={() => setSelectedSource(source)}>
                          <FileText size={14} /> Source {index + 1} {source.chunk !== undefined ? `- chunk ${source.chunk}` : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.article>
          ))}
          {loading && <div className="thinking"><Loader2 size={16} className="spin" /> Searching indexed chunks...</div>}
          <div ref={conversationEndRef} />
        </section>

        <form className="question-composer" onSubmit={sendQuestion}>
          <button type="button" aria-label="Attach file" onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /></button>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask anything about your uploaded documents..." rows={1} onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void sendQuestion();
            }
          }} />
          <button type="button" aria-label="Voice input"><Mic size={18} /></button>
          <button type="submit" aria-label="Send question" disabled={!question.trim() || loading}><ArrowUp size={18} /></button>
        </form>
      </main>

      <aside className="workspace-right" aria-label="Document context">
        <div className="context-header">
          <span>Context</span>
          <strong>{stats.ready} files ready</strong>
        </div>
        <dl className="stats-grid">
          <div><dt>Files</dt><dd>{documents.length}</dd></div>
          <div><dt>Chunks</dt><dd>{stats.chunks}</dd></div>
          <div><dt>Indexed</dt><dd>{stats.ready}</dd></div>
        </dl>

        <section className="upload-panel" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
          event.preventDefault();
          void uploadFiles(event.dataTransfer.files);
        }}>
          <div><Upload size={18} /> Add documents</div>
          <p>Drag PDFs here, upload individual PDFs, or upload a folder.</p>
          <div>
            <button onClick={() => fileInputRef.current?.click()}>Upload PDFs</button>
            <button onClick={() => folderInputRef.current?.click()}>Upload Folder</button>
          </div>
        </section>

        <section className="document-table">
          <div className="sidebar-heading">Files</div>
          {documents.map((doc) => (
            <article key={doc.id}>
              <FileText size={16} />
              <div>
                <strong>{doc.filename}</strong>
                <span>{formatSize(doc.size)} - {doc.chunks} chunks</span>
                <i><b style={{ width: `${doc.progress}%` }} /></i>
              </div>
              <em className={doc.status}>{doc.status}</em>
            </article>
          ))}
        </section>

        <section className="citation-preview">
          <div className="sidebar-heading">Selected citation preview</div>
          {selectedSource ? (
            <pre>{JSON.stringify(selectedSource, null, 2)}</pre>
          ) : (
            <p className="empty-text">Ask a question to inspect the source metadata returned by the backend.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
