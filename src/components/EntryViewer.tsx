import { useState } from 'react';
import { Edit2, Calendar, Tag, BookOpen, Lightbulb, Code2, Copy, Check } from 'lucide-react';
import { BlogEntry, LANGUAGES } from '../types';
import { CodePreview } from './CodePreview';
import { format, parseISO } from 'date-fns';

interface EntryViewerProps {
  entry: BlogEntry;
  onEdit: () => void;
}

export function EntryViewer({ entry, onEdit }: EntryViewerProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'notes'>('code');
  const [copied, setCopied] = useState(false);
  const lang = LANGUAGES.find((l) => l.value === entry.language) || LANGUAGES[0];

  function copyCode() {
    navigator.clipboard.writeText(entry.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-800 bg-[#161b22]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: `${lang.color}20`, color: lang.color }}
            >
              {lang.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white leading-tight">{entry.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                  style={{ backgroundColor: `${lang.color}20`, color: lang.color }}
                >
                  {lang.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(entry.date), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Tag className="w-3 h-3 text-gray-600" />
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 border border-gray-700/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-[#161b22] px-4">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            activeTab === 'code'
              ? 'text-emerald-400 border-emerald-400'
              : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            activeTab === 'preview'
              ? 'text-emerald-400 border-emerald-400'
              : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            activeTab === 'notes'
              ? 'text-emerald-400 border-emerald-400'
              : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Notes & Reflections
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && (
          <div className="h-full flex flex-col">
            <div className="relative flex-1 overflow-auto">
              {/* Code Header Bar */}
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
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Code Content */}
              <div className="p-4 bg-[#0d1117]">
                <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  <code>
                    {entry.code.split('\n').map((line, i) => (
                      <div key={i} className="flex">
                        <span className="select-none text-gray-700 text-right w-8 mr-4 shrink-0 text-xs leading-relaxed">
                          {i + 1}
                        </span>
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
            {/* Summary */}
            {entry.summary && (
              <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">What I Learned</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{entry.summary}</p>
              </div>
            )}

            {/* Reflection */}
            {entry.reflection && (
              <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">How I Think This Code Is Used</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{entry.reflection}</p>
              </div>
            )}

            {/* Meta Info */}
            <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Entry Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-600">Language</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: lang.color }}
                    >
                      {lang.icon} {lang.label}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-600">Date</span>
                  <p className="text-sm text-gray-300 mt-1">
                    {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-600">Lines of Code</span>
                  <p className="text-sm text-gray-300 mt-1">{entry.code.split('\n').length} lines</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-600">Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!entry.summary && !entry.reflection && (
              <div className="text-center py-12 text-gray-600">
                <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notes added yet</p>
                <button
                  onClick={onEdit}
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Add your reflections →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
