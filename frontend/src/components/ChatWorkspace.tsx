import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  FileText,
  RotateCcw,
  Search,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { SourceMetadata } from '../services/api';

export interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: SourceMetadata[];
  timestamp: string;
}

interface ChatWorkspaceProps {
  messages: MessageItem[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  onSelectPrompt: (text: string) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  onSelectPrompt,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // Helper to format basic markdown lists and paragraphs cleanly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2.5 text-sm leading-relaxed text-[#D6E6F3]">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Bullet point line
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F52BA]" />
                <span>{trimmed.substring(2)}</span>
              </div>
            );
          }

          // Numbered item
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s(.*)$/);
            if (match) {
              return (
                <div key={idx} className="flex items-start space-x-2 pl-2">
                  <span className="font-semibold text-[#0F52BA]">{match[1]}</span>
                  <span>{match[2]}</span>
                </div>
              );
            }
          }

          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-[#000926]">
      {/* Top Banner / Toolbar */}
      <div className="flex h-12 items-center justify-between border-b border-[rgba(166,197,215,0.15)] bg-[#040f36]/40 px-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-[#A6C5D7]">
          <Search className="h-3.5 w-3.5 text-[#0F52BA]" />
          <span>Semantic RAG Search Workspace</span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="btn-secondary flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs text-[#A6C5D7] hover:text-[#D6E6F3]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Conversation</span>
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {messages.length === 0 ? (
          /* Empty Welcome Hero */
          <div className="mx-auto my-auto max-w-2xl animate-fade-in py-6 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F52BA] to-[#1664db] text-white shadow-xl shadow-[#0F52BA]/30">
              <Sparkles className="h-7 w-7" />
            </div>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#D6E6F3] sm:text-3xl">
              Chat with your Documents
            </h1>
            <p className="mb-6 text-sm text-[#A6C5D7] sm:text-base">
              DocIntel AI searches only the relevant portions of your uploaded PDFs and answers in natural language.
            </p>

            {/* Problem vs Solution Info Cards */}
            <div className="mb-8 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-[rgba(166,197,215,0.15)] bg-[#040f36]/70 p-4">
                <span className="mb-1 inline-block rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                  The Problem
                </span>
                <p className="mt-1 text-xs text-[#A6C5D7] leading-relaxed">
                  Reading hundreds of pages in Research papers, Company reports, Legal documents, Placement notes, or Technical PDFs just to find one answer is slow and tedious.
                </p>
              </div>

              <div className="rounded-2xl border border-[#0F52BA]/30 bg-[#0F52BA]/10 p-4">
                <span className="mb-1 inline-block rounded bg-[#0F52BA]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#D6E6F3]">
                  The DocIntel Solution
                </span>
                <p className="mt-1 text-xs text-[#D6E6F3] leading-relaxed">
                  Upload your PDF and ask questions in natural language. DocIntel retrieves only the relevant vector chunks and generates precise answers with citations.
                </p>
              </div>
            </div>

            {/* Quick Starters */}
            <div className="text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#A6C5D7]">
                Try asking a question:
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  'Explain deadlock.',
                  'What are the Coffman conditions?',
                  'Which scheduling algorithm gives minimum waiting time?',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectPrompt(promptText)}
                    className="quick-pill group flex flex-col justify-between rounded-xl p-3 text-left transition-all hover:scale-[1.02]"
                  >
                    <span className="mb-2 text-xs font-medium text-[#D6E6F3]">
                      "{promptText}"
                    </span>
                    <span className="flex items-center text-[11px] font-semibold text-[#0F52BA] group-hover:text-blue-300">
                      Ask DocIntel <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Messages Feed */
          <div className="mx-auto max-w-4xl space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full animate-fade-in ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-[90%] sm:max-w-[82%] space-x-3 rounded-2xl p-4 sm:p-5 ${
                    msg.sender === 'user'
                      ? 'border border-[#0F52BA]/50 bg-[#0F52BA]/20 text-[#D6E6F3]'
                      : 'border border-[rgba(166,197,215,0.15)] bg-[#040f36]/80 text-[#D6E6F3]'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="shrink-0">
                    {msg.sender === 'user' ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F52BA] text-white">
                        <User className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F52BA] to-[#1664db] text-white shadow-md shadow-[#0F52BA]/30">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 overflow-hidden">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide text-[#A6C5D7]">
                        {msg.sender === 'user' ? 'You' : 'DocIntel AI'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-[#A6C5D7]/70">
                          {msg.timestamp}
                        </span>
                        {msg.sender === 'ai' && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="rounded p-1 text-[#A6C5D7] hover:bg-white/10 hover:text-[#D6E6F3]"
                            title="Copy answer"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    {msg.sender === 'user' ? (
                      <p className="text-sm text-[#D6E6F3]">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}

                    {/* Retrieved Sources Citations */}
                    {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 border-t border-[rgba(166,197,215,0.12)] pt-3">
                        <button
                          onClick={() => toggleSources(msg.id)}
                          className="flex items-center space-x-1.5 text-xs font-medium text-[#A6C5D7] hover:text-[#D6E6F3]"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-[#0F52BA]" />
                          <span>
                            Retrieved from <strong>{msg.sources.length}</strong> document chunk{msg.sources.length === 1 ? '' : 's'}
                          </span>
                          {expandedSources[msg.id] ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {expandedSources[msg.id] && (
                          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                            {msg.sources.map((src, idx) => (
                              <div
                                key={idx}
                                className="rounded-xl border border-[rgba(166,197,215,0.15)] bg-[#000926]/70 p-2.5 text-xs"
                              >
                                <div className="flex items-center space-x-1.5 font-semibold text-[#D6E6F3]">
                                  <FileText className="h-3.5 w-3.5 text-[#0F52BA]" />
                                  <span className="truncate">
                                    {src.source || src.filename || 'Uploaded Document'}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-[#A6C5D7]">
                                  Vector Chunk #{src.chunk !== undefined ? src.chunk + 1 : idx + 1}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading AI Response indicator */}
            {isLoading && (
              <div className="flex w-full justify-start animate-fade-in">
                <div className="flex items-center space-x-3 rounded-2xl border border-[rgba(166,197,215,0.15)] bg-[#040f36]/80 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F52BA] to-[#1664db] text-white">
                    <Sparkles className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-[#D6E6F3]">
                      Searching document vectors & generating answer...
                    </span>
                    <span className="flex space-x-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0F52BA]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0F52BA] [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0F52BA] [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Footer */}
      <div className="border-t border-[rgba(166,197,215,0.15)] bg-[#040f36]/90 p-4 backdrop-blur-xl sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything about your uploaded documents... (e.g. 'Explain deadlock.')"
              className="glass-input w-full resize-none rounded-2xl py-3.5 pl-4 pr-28 text-sm text-[#D6E6F3] placeholder-[#A6C5D7]/60"
            />
            <div className="absolute right-2 flex items-center">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="btn-primary flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#A6C5D7]">
            <span>Press Enter to submit • DocIntel AI uses RAG to answer from relevant document sections</span>
            <span className="hidden sm:inline">Powered by Gemini & ChromaDB</span>
          </div>
        </form>
      </div>
    </main>
  );
};
