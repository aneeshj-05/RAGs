import React from 'react';
import { Sparkles, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

interface NavbarProps {
  isBackendOnline: boolean;
  activeDocCount: number;
  onOpenInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isBackendOnline,
  activeDocCount,
  onOpenInfo,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[rgba(166,197,215,0.15)] bg-[#000926]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F52BA] to-[#1664db] text-white shadow-lg shadow-[#0F52BA]/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-[#D6E6F3] sm:text-xl">
                DocIntel AI
              </span>
              <span className="hidden rounded-full border border-[#0F52BA]/40 bg-[#0F52BA]/15 px-2.5 py-0.5 text-xs font-medium text-[#D6E6F3] sm:inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#A6C5D7]" />
                RAG 2.0
              </span>
            </div>
            <p className="hidden text-xs text-[#A6C5D7]/80 md:block">
              AI-powered Document Intelligence Platform
            </p>
          </div>
        </div>

        {/* Center / Stats & Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 rounded-full border border-[rgba(166,197,215,0.15)] bg-[#040f36] px-3 py-1.5 text-xs">
            <div
              className={`h-2 w-2 rounded-full ${
                isBackendOnline
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
              }`}
            />
            <span className="font-medium text-[#D6E6F3]">
              {isBackendOnline ? 'RAG Engine Online' : 'Connecting to API...'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 rounded-full border border-[rgba(166,197,215,0.15)] bg-[#040f36] px-3 py-1.5 text-xs text-[#A6C5D7]">
            <FileText className="h-3.5 w-3.5 text-[#0F52BA]" />
            <span>
              <strong className="text-[#D6E6F3] font-semibold">{activeDocCount}</strong>{' '}
              {activeDocCount === 1 ? 'Doc Indexed' : 'Docs Indexed'}
            </span>
          </div>

          <button
            onClick={onOpenInfo}
            className="btn-secondary flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#D6E6F3]"
            title="About DocIntel AI"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
};
