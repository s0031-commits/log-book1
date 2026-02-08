import { useState, useEffect } from 'react';
import { Save, X, Tag, Sparkles } from 'lucide-react';
import { BlogEntry, Language, LANGUAGES } from '../types';
import { CodePreview } from './CodePreview';

interface EntryEditorProps {
  entry?: BlogEntry | null;
  onSave: (entry: { title: string; language: Language; code: string; summary: string; reflection: string; tags: string[]; date: string }) => void;
  onCancel: () => void;
}

export function EntryEditor({ entry, onSave, onCancel }: EntryEditorProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [language, setLanguage] = useState<Language>(entry?.language || 'javascript');
  const [code, setCode] = useState(entry?.code || '');
  const [summary, setSummary] = useState(entry?.summary || '');
  const [reflection, setReflection] = useState(entry?.reflection || '');
  const [tags, setTags] = useState(entry?.tags.join(', ') || '');
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setLanguage(entry.language);
      setCode(entry.code);
      setSummary(entry.summary);
      setReflection(entry.reflection);
      setTags(entry.tags.join(', '));
      setDate(entry.date);
    }
  }, [entry]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    onSave({
      title: title.trim(),
      language,
      code,
      summary: summary.trim(),
      reflection: reflection.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      date,
    });
  }

  const selectedLang = LANGUAGES.find(l => l.value === language)!;

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            {entry ? 'Edit Entry' : 'New Entry'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showPreview
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {showPreview ? '✦ Preview On' : '◇ Preview Off'}
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className={`${showPreview ? 'grid grid-cols-2 gap-0 h-full' : 'h-full flex flex-col'}`}>
          {/* Left: Editor */}
          <div className={`flex flex-col ${showPreview ? 'border-r border-gray-800' : ''} overflow-y-auto`}>
            <div className="p-6 space-y-5">
              {/* Title + Date */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="What did you learn today?"
                    className="w-full bg-[#161b22] text-white px-4 py-2.5 rounded-xl border border-gray-800 focus:border-emerald-500/50 focus:outline-none placeholder-gray-600 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#161b22] text-white px-4 py-2.5 rounded-xl border border-gray-800 focus:border-emerald-500/50 focus:outline-none text-sm transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Language</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setLanguage(lang.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                        language === lang.value
                          ? 'border-2 shadow-lg scale-105'
                          : 'border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                      }`}
                      style={language === lang.value ? {
                        borderColor: lang.color,
                        backgroundColor: `${lang.color}15`,
                        color: lang.color,
                        boxShadow: `0 4px 15px ${lang.color}20`,
                      } : {}}
                    >
                      <span className="text-sm">{lang.icon}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Code</label>
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: `${selectedLang.color}20`, color: selectedLang.color }}>
                    {selectedLang.label}
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-gray-800 focus-within:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-[#1c2333] border-b border-gray-800/50">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                    <span className="ml-2 text-[10px] text-gray-600">code editor</span>
                  </div>
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder={`// Write your ${selectedLang.label} code here...\n`}
                    className="w-full bg-[#0d1117] text-gray-300 px-4 py-3 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-gray-700 min-h-[250px]"
                    rows={14}
                    spellCheck={false}
                    required
                  />
                  <div className="flex items-center justify-between px-4 py-1.5 bg-[#1c2333] border-t border-gray-800/50">
                    <span className="text-[10px] text-gray-600">{code.split('\n').length} lines</span>
                    <span className="text-[10px] text-gray-600">{code.length} chars</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">📝 What I Learned</label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Summarize what you learned today..."
                  className="w-full bg-[#161b22] text-gray-300 px-4 py-3 rounded-xl border border-gray-800 focus:border-emerald-500/50 focus:outline-none placeholder-gray-600 text-sm leading-relaxed resize-none transition-colors"
                  rows={3}
                />
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">💡 How I Think This Code Is Used</label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="How do you think this code is used in real-world applications?"
                  className="w-full bg-[#161b22] text-gray-300 px-4 py-3 rounded-xl border border-gray-800 focus:border-emerald-500/50 focus:outline-none placeholder-gray-600 text-sm leading-relaxed resize-none transition-colors"
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  <Tag className="w-3 h-3" /> Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="arrays, loops, functions (comma separated)"
                  className="w-full bg-[#161b22] text-gray-300 px-4 py-2.5 rounded-xl border border-gray-800 focus:border-emerald-500/50 focus:outline-none placeholder-gray-600 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Save */}
            <div className="sticky bottom-0 p-4 bg-[#0d1117] border-t border-gray-800">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                {entry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>

          {/* Right: Preview */}
          {showPreview && (
            <div className="h-full">
              <CodePreview code={code} language={language} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
