import { useState } from 'react';
import { Calendar, Tag, BookOpen, Lightbulb, Code2, Copy, Check, Users, Eye, Shield } from 'lucide-react';
import { BlogEntry, AcceptedShare, LANGUAGES } from '../types';
import { CodePreview } from './CodePreview';
import { format, parseISO } from 'date-fns';

interface SharedEntryViewerProps {
  share: AcceptedShare;
  entries: BlogEntry[];
}

export function SharedEntryViewer({ share, entries }: SharedEntryViewerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'notes'>('code');
  const [copied, setCopied] = useState(false);

  const entry = entries[selectedIdx];

  function copyCode() {
    if (!entry) return;
    navigator.clipboard.writeText(entry.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Share Unavailable</h2>
          <p className="text-sm text-gray-500">This shared collection may have been revoked or the entries were deleted.</p>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  const lang = LANGUAGES.find(l => l.value === entry.language) || LANGUAGES[0];

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Shared banner */}
      <div className="px-6 py-2.5 bg-purple-500/10 border-b border-purple-500/20 flex items-center gap-2">
        <Shield className="w-4 h-4 text-purple-400" />
        <span className="text-xs text-purple-300 font-medium">
          Shared by <strong>{share.ownerName}</strong> — View Only
        </span>
        <span className="text-xs text-purple-500/60 ml-auto">{share.ownerEmail}</span>
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-[#161b22]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{share.label}</h2>
            <p className="text-xs text-gray-500">{entries.length} {entries.length === 1 ? 'entry' : 'entries'} shared</p>
          </div>
        </div>

        {/* Entry selector */}
        {entries.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {entries.map((e, i) => {
              const l = LANGUAGES.find(x => x.value === e.language) || LANGUAGES[0];
              return (
                <button
                  key={e.id}
                  onClick={() => { setSelectedIdx(i); setActiveTab('code'); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shrink-0 transition-all ${
                    selectedIdx === i
                      ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300'
                      : 'bg-[#0d1117] border border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span style={{ color: l.color }}>{l.icon}</span>
                  <span className="truncate max-w-[120px]">{e.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected entry header */}
      <div className="px-6 py-3 border-b border-gray-800 bg-[#0d1117]">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: `${lang.color}20`, color: lang.color }}
          >
            {lang.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">{entry.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ backgroundColor: `${lang.color}20`, color: lang.color }}>
                {lang.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {format(parseISO(entry.date), 'MMMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1 text-xs text-purple-400">
                <Eye className="w-3 h-3" />
                View Only
              </span>
            </div>
            {entry.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Tag className="w-3 h-3 text-gray-600" />
                {entry.tags.map(tag => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-[#161b22] px-4">
        {[
          { id: 'code' as const, label: 'Code', icon: Code2 },
          { id: 'preview' as const, label: 'Preview', icon: BookOpen },
          { id: 'notes' as const, label: 'Notes & Reflections', icon: Lightbulb },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && (
          <div className="h-full flex flex-col">
            <div className="relative flex-1 overflow-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[#1c2333] border-b border-gray-800/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                  <span className="ml-2 text-[10px] text-gray-600">
                    {entry.title.toLowerCase().replace(/\s+/g, '-')}.{entry.language === 'web' ? 'html' : entry.language === 'react' ? 'jsx' : entry.language}
                  </span>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                  ) : (
                    <><Copy className="w-3 h-3" />Copy</>
                  )}
                </button>
              </div>
              <div className="p-4 bg-[#0d1117]">
                <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  <code>
                    {entry.code.split('\n').map((line, i) => (
                      <div key={i} className="flex">
                        <span className="select-none text-gray-700 text-right w-8 mr-4 shrink-0 text-xs leading-relaxed">{i + 1}</span>
                        <span className="text-gray-300 flex-1">{line || ' '}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="h-full">
            <CodePreview code={entry.code} language={entry.language} />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="h-full overflow-y-auto p-6 space-y-6">
            {entry.summary && (
              <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">What They Learned</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{entry.summary}</p>
              </div>
            )}
            {entry.reflection && (
              <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">How They Think This Code Is Used</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{entry.reflection}</p>
              </div>
            )}
            {!entry.summary && !entry.reflection && (
              <div className="text-center py-12 text-gray-600">
                <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notes were added to this entry</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
