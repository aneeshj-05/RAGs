import React from 'react';
import { X, Sparkles, CheckCircle2, FileText, Layers } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000926]/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[rgba(166,197,215,0.2)] bg-[#040f36] p-6 shadow-2xl sm:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-2 text-[#A6C5D7] transition-colors hover:bg-white/10 hover:text-[#D6E6F3]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F52BA] to-[#1664db] text-white shadow-lg shadow-[#0F52BA]/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#D6E6F3] sm:text-2xl">
              DocIntel AI
            </h2>
            <p className="text-xs font-medium text-[#A6C5D7]">
              An AI-powered Document Intelligence platform
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-[#D6E6F3]">
          <div className="rounded-2xl border border-[rgba(166,197,215,0.15)] bg-[#000926]/80 p-4">
            <p className="font-medium leading-relaxed text-[#D6E6F3]">
              DocIntel AI lets users chat with their documents in natural language using{' '}
              <strong className="text-[#0F52BA]">Retrieval-Augmented Generation (RAG)</strong>.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <h3 className="mb-2 flex items-center space-x-1.5 font-semibold text-red-300">
                <FileText className="h-4 w-4" />
                <span>The Problem</span>
              </h3>
              <p className="text-xs leading-relaxed text-[#A6C5D7]">
                People have large documents (Research papers, Company reports, Legal documents, Placement notes, and Technical PDFs). Reading hundreds of pages just to find one answer is slow and inefficient.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h3 className="mb-2 flex items-center space-x-1.5 font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>The Solution</span>
              </h3>
              <p className="text-xs leading-relaxed text-[#A6C5D7]">
                Instead of reading the entire PDF, simply upload it and ask questions in natural language. DocIntel searches only the relevant portions of the document and answers from those sections.
              </p>
            </div>
          </div>

          {/* Architecture Highlights */}
          <div className="space-y-2">
            <h3 className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-[#A6C5D7]">
              <Layers className="h-4 w-4 text-[#0F52BA]" />
              <span>How it Works</span>
            </h3>
            <ul className="grid gap-2 text-xs text-[#D6E6F3] sm:grid-cols-3">
              <li className="rounded-xl border border-[rgba(166,197,215,0.15)] bg-[#000926]/50 p-3">
                <strong className="block text-[#0F52BA]">1. PDF Ingestion</strong>
                <span>Extracts and chunks text with smart overlap.</span>
              </li>
              <li className="rounded-xl border border-[rgba(166,197,215,0.15)] bg-[#000926]/50 p-3">
                <strong className="block text-[#0F52BA]">2. ChromaDB RAG</strong>
                <span>Semantic vector similarity search finds relevant sections.</span>
              </li>
              <li className="rounded-xl border border-[rgba(166,197,215,0.15)] bg-[#000926]/50 p-3">
                <strong className="block text-[#0F52BA]">3. Gemini Answers</strong>
                <span>Synthesizes accurate answers with verified source citations.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary rounded-xl px-6 py-2.5 text-xs font-semibold"
          >
            Got it, Let's Chat
          </button>
        </div>
      </div>
    </div>
  );
};
