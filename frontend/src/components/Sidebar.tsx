import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import type { DocumentItem } from '../services/api';

interface SidebarProps {
  documents: DocumentItem[];
  onDocumentUploaded: (doc: DocumentItem) => void;
  onSelectPrompt: (promptText: string) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  onDocumentUploaded,
  onSelectPrompt,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUploadedChunks, setLastUploadedChunks] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePrompts = [
    'Explain deadlock.',
    'What are the Coffman conditions?',
    'Which scheduling algorithm gives minimum waiting time?',
  ];

  const handleFileChange = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus('error');
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');
    setLastUploadedChunks(null);

    try {
      const res = await api.uploadPdf(file, (percent) => {
        setUploadProgress(percent);
      });

      const newDoc: DocumentItem = {
        id: Math.random().toString(36).substring(2, 9),
        filename: res.filename || file.name,
        chunks: res.chunks || 0,
        uploadedAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setUploadStatus('success');
      setLastUploadedChunks(res.chunks || 0);
      onDocumentUploaded(newDoc);

      setTimeout(() => {
        setUploadStatus('idle');
      }, 5000);
    } catch (err: any) {
      setUploadStatus('error');
      setErrorMessage(
        err.response?.data?.detail || 'Upload failed. Ensure backend is running.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  return (
    <aside className="flex w-full flex-col border-r border-[rgba(166,197,215,0.15)] bg-[#040f36]/40 p-4 sm:w-80 md:w-88 lg:w-96">
      {/* Section Title */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider text-[#D6E6F3]">
          <Layers className="h-4 w-4 text-[#0F52BA]" />
          <span>Document Intelligence</span>
        </h2>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative mb-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
          isDragging
            ? 'border-[#0F52BA] bg-[#0F52BA]/15 scale-[1.01]'
            : 'border-[rgba(166,197,215,0.25)] bg-[#000926]/60 hover:border-[#0F52BA]/70 hover:bg-[#040f36]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F52BA]/15 text-[#D6E6F3] transition-transform group-hover:scale-110">
          <Upload className="h-6 w-6 text-[#D6E6F3]" />
        </div>

        <p className="mb-1 text-sm font-semibold text-[#D6E6F3]">
          Upload PDF Document
        </p>
        <p className="text-xs text-[#A6C5D7]">
          Drag & drop or click to browse (up to hundreds of pages)
        </p>

        {/* Upload State Feedback */}
        {uploadStatus === 'uploading' && (
          <div className="mt-4 w-full rounded-xl bg-[#000926] p-3 text-left">
            <div className="mb-1.5 flex items-center justify-between text-xs text-[#D6E6F3]">
              <span className="flex items-center gap-1.5 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F52BA]" />
                Indexing chunks...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(166,197,215,0.15)]">
              <div
                className="h-full bg-gradient-to-r from-[#0F52BA] to-blue-400 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-4 flex w-full items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              Successfully indexed{' '}
              <strong className="text-white">{lastUploadedChunks}</strong> vector chunks!
            </span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 flex w-full items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents Library */}
      <div className="mb-6 flex-1">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A6C5D7]">
            Active Knowledge Base
          </span>
          <span className="rounded-full bg-[#0F52BA]/20 px-2 py-0.5 text-[10px] font-medium text-[#D6E6F3]">
            {documents.length}
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {documents.length === 0 ? (
            <div className="rounded-xl border border-[rgba(166,197,215,0.1)] bg-[#000926]/40 p-3 text-center">
              <BookOpen className="mx-auto mb-1.5 h-6 w-6 text-[#A6C5D7]/50" />
              <p className="text-xs font-medium text-[#D6E6F3]">No PDFs uploaded yet</p>
              <p className="text-[11px] text-[#A6C5D7]">
                Try uploading "Operating Systems Notes (200 pages)"
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center justify-between rounded-xl border border-[rgba(166,197,215,0.15)] bg-[#000926]/80 p-3 transition-colors hover:border-[#0F52BA]/50"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F52BA]/20 text-[#D6E6F3]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-xs font-medium text-[#D6E6F3]" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <p className="text-[10px] text-[#A6C5D7]">
                      {doc.chunks} vector chunks • {doc.uploadedAt}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Ready
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Suggested RAG Prompts */}
      <div>
        <div className="mb-2.5 flex items-center space-x-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#0F52BA]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A6C5D7]">
            Sample Queries
          </span>
        </div>
        <div className="space-y-1.5">
          {samplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onSelectPrompt(prompt)}
              disabled={isLoading}
              className="quick-pill flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-medium"
            >
              <span className="line-clamp-1">{prompt}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
