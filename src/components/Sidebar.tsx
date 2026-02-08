import { Plus, BookOpen, Code2, Calendar, Trash2, Search, Share2, LogOut, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { BlogEntry, AcceptedShare, LANGUAGES } from '../types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useState } from 'react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  entries: BlogEntry[];
  selectedId: string | null;
  acceptedShares: AcceptedShare[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenShare: () => void;
  onLogout: () => Promise<void> | void;
  onViewSharedEntry: (shareCode: string) => void;
  activeSharedCode: string | null;
}

export function Sidebar({
  user,
  entries,
  selectedId,
  acceptedShares,
  onSelect,
  onNew,
  onDelete,
  onOpenShare,
  onLogout,
  onViewSharedEntry,
  activeSharedCode,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sharedExpanded, setSharedExpanded] = useState(true);

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.language.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filtered.reduce<Record<string, BlogEntry[]>>((acc, entry) => {
    const dateKey = entry.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function formatDateGroup(dateStr: string) {
    const date = parseISO(dateStr);
    if (isToday(date)) return '📅 Today';
    if (isYesterday(date)) return '📅 Yesterday';
    return `📅 ${format(date, 'MMM d, yyyy')}`;
  }

  function getLangConfig(lang: string) {
    return LANGUAGES.find((l) => l.value === lang) || LANGUAGES[0];
  }

  const initials = user.displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-gray-800">
      {/* User Profile Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#161b22] transition-colors"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#1c2333] rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                <button
                  onClick={() => { onOpenShare(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-purple-400" />
                  Share & Invites
                </button>
                <div className="border-t border-gray-700/50"></div>
                <button
                  onClick={() => { onLogout(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2 border-b border-gray-800">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>

        <button
          onClick={onOpenShare}
          className="w-full flex items-center justify-center gap-2 bg-[#161b22] hover:bg-[#1c2333] text-purple-400 font-medium py-2 px-4 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all text-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share & Invite
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] text-sm text-gray-300 placeholder-gray-600 pl-9 pr-3 py-2 rounded-lg border border-gray-800 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="flex-1 bg-[#161b22] rounded-lg p-2 text-center border border-gray-800/50">
          <div className="text-base font-bold text-emerald-400">{entries.length}</div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Entries</div>
        </div>
        <div className="flex-1 bg-[#161b22] rounded-lg p-2 text-center border border-gray-800/50">
          <div className="text-base font-bold text-cyan-400">
            {new Set(entries.map(e => e.language)).size}
          </div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Langs</div>
        </div>
        <div className="flex-1 bg-[#161b22] rounded-lg p-2 text-center border border-gray-800/50">
          <div className="text-base font-bold text-purple-400">{acceptedShares.length}</div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Shared</div>
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* My Entries */}
        {sortedDates.length === 0 && acceptedShares.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No entries yet</p>
            <p className="text-xs mt-1">Start logging your progress!</p>
          </div>
        )}

        {sortedDates.map((date) => (
          <div key={date} className="mb-4">
            <div className="flex items-center gap-2 px-2 py-2">
              <Calendar className="w-3 h-3 text-gray-600" />
              <span className="text-xs font-medium text-gray-500">{formatDateGroup(date)}</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>
            <div className="space-y-1">
              {grouped[date]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((entry) => {
                  const lang = getLangConfig(entry.language);
                  const isSelected = entry.id === selectedId && !activeSharedCode;
                  return (
                    <div
                      key={entry.id}
                      className={`group relative flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'hover:bg-[#161b22] border border-transparent'
                      }`}
                      onClick={() => onSelect(entry.id)}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: `${lang.color}20`, color: lang.color }}
                      >
                        {lang.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-emerald-300' : 'text-gray-300'}`}>
                          {entry.title}
                        </h3>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{entry.summary}</p>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                        className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded-md hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Shared With Me */}
        {acceptedShares.length > 0 && (
          <div className="mt-4 mb-4">
            <button
              onClick={() => setSharedExpanded(!sharedExpanded)}
              className="flex items-center gap-2 px-2 py-2 w-full"
            >
              {sharedExpanded ? <ChevronDown className="w-3 h-3 text-purple-400" /> : <ChevronRight className="w-3 h-3 text-purple-400" />}
              <Users className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">Shared With Me</span>
              <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full">{acceptedShares.length}</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </button>
            {sharedExpanded && (
              <div className="space-y-1 mt-1">
                {acceptedShares.map(share => (
                  <div
                    key={share.shareCode}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                      activeSharedCode === share.shareCode
                        ? 'bg-purple-500/10 border border-purple-500/30'
                        : 'hover:bg-[#161b22] border border-transparent'
                    }`}
                    onClick={() => onViewSharedEntry(share.shareCode)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${activeSharedCode === share.shareCode ? 'text-purple-300' : 'text-gray-300'}`}>
                        {share.label}
                      </h3>
                      <p className="text-[11px] text-gray-600 truncate">by {share.ownerName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div className="p-3 border-t border-gray-800 flex items-center justify-center gap-2">
        <Code2 className="w-3.5 h-3.5 text-gray-700" />
        <span className="text-[10px] text-gray-700 font-medium">CodeLog v2.0</span>
      </div>
    </div>
  );
}
