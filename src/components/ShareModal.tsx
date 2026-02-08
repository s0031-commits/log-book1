import { useState } from 'react';
import { X, Copy, Check, Share2, Link2, Trash2, Send, Users, Shield } from 'lucide-react';
import { BlogEntry, ShareInvite, AcceptedShare, LANGUAGES } from '../types';

interface ShareModalProps {
  entries: BlogEntry[];
  myShares: ShareInvite[];
  acceptedShares: AcceptedShare[];
  onCreateShare: (entryIds: string[], label: string) => Promise<ShareInvite | null>;
  onRevokeShare: (shareId: string) => Promise<void>;
  onAcceptInvite: (code: string) => Promise<{ success: boolean; error?: string }>;
  onRemoveAccepted: (code: string) => Promise<void>;
  onClose: () => void;
}

export function ShareModal({
  entries,
  myShares,
  acceptedShares,
  onCreateShare,
  onRevokeShare,
  onAcceptInvite,
  onRemoveAccepted,
  onClose,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'my-shares' | 'join'>('create');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [shareLabel, setShareLabel] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newShareCode, setNewShareCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  function toggleEntry(id: string) {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleCreateShare() {
    if (selectedEntries.length === 0) return;
    setIsCreating(true);
    try {
      const invite = await onCreateShare(selectedEntries, shareLabel || 'My shared entries');
      if (invite) {
        setNewShareCode(invite.code);
        setSelectedEntries([]);
        setShareLabel('');
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoin() {
    setJoinError('');
    setJoinSuccess(false);
    setIsJoining(true);
    try {
      const result = await onAcceptInvite(inviteCode);
      if (result.success) {
        setJoinSuccess(true);
        setInviteCode('');
      } else {
        setJoinError(result.error || 'Failed to join');
      }
    } finally {
      setIsJoining(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#161b22] rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Share & Collaborate</h2>
              <p className="text-xs text-gray-500">Share entries or join shared collections</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-4">
          {[
            { id: 'create' as const, label: 'Create Invite', icon: Send },
            { id: 'my-shares' as const, label: `My Shares (${myShares.length})`, icon: Link2 },
            { id: 'join' as const, label: `Join (${acceptedShares.length})`, icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
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
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {/* Create Share */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              {newShareCode ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Share Created!</h3>
                  <p className="text-sm text-gray-400 mb-4">Send this code to anyone you want to share with:</p>
                  <div className="inline-flex items-center gap-2 bg-[#0d1117] px-6 py-3 rounded-xl border border-gray-700">
                    <code className="text-2xl font-mono font-bold text-emerald-400 tracking-widest">{newShareCode}</code>
                    <button
                      onClick={() => copyCode(newShareCode)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {copiedCode === newShareCode ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setNewShareCode(null)}
                    className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Create another share →
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                      Share Label
                    </label>
                    <input
                      type="text"
                      value={shareLabel}
                      onChange={e => setShareLabel(e.target.value)}
                      placeholder="e.g., My JavaScript notes"
                      className="w-full bg-[#0d1117] text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-purple-500/50 focus:outline-none text-sm placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                      Select entries to share ({selectedEntries.length} selected)
                    </label>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto rounded-xl border border-gray-800 p-2 bg-[#0d1117]">
                      {entries.length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-4">No entries to share yet</p>
                      ) : (
                        entries.map(entry => {
                          const lang = LANGUAGES.find(l => l.value === entry.language) || LANGUAGES[0];
                          const isSelected = selectedEntries.includes(entry.id);
                          return (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => toggleEntry(entry.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                                isSelected
                                  ? 'bg-purple-500/10 border border-purple-500/30'
                                  : 'hover:bg-gray-800/50 border border-transparent'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{ backgroundColor: `${lang.color}20`, color: lang.color }}
                              >
                                {lang.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium truncate block ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                  {entry.title}
                                </span>
                                <span className="text-[11px] text-gray-600">{entry.date}</span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                    <p className="text-xs text-gray-400">
                      Shared entries are <strong className="text-purple-300">view-only</strong>. Recipients can see your code and notes but cannot edit them.
                    </p>
                  </div>

                  <button
                    onClick={handleCreateShare}
                    disabled={selectedEntries.length === 0 || isCreating}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isCreating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Generate Invite Code
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* My Shares */}
          {activeTab === 'my-shares' && (
            <div className="space-y-3">
              {myShares.length === 0 ? (
                <div className="text-center py-10">
                  <Link2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No active shares</p>
                  <p className="text-xs text-gray-600 mt-1">Create an invite to share your entries</p>
                </div>
              ) : (
                myShares.map(share => (
                  <div key={share.id} className="bg-[#0d1117] rounded-xl p-4 border border-gray-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white">{share.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {share.entryIds.length} {share.entryIds.length === 1 ? 'entry' : 'entries'} shared
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-sm font-mono font-bold text-purple-400 tracking-wider bg-purple-500/10 px-2 py-0.5 rounded">
                            {share.code}
                          </code>
                          <button
                            onClick={() => copyCode(share.code)}
                            className="p-1 hover:bg-gray-800 rounded transition-colors"
                          >
                            {copiedCode === share.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-2">
                          Created {new Date(share.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onRevokeShare(share.id)}
                        className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-400 rounded-lg transition-colors"
                        title="Revoke share"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Join / Accept Invite */}
          {activeTab === 'join' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Enter Invite Code</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={e => { setInviteCode(e.target.value.toUpperCase()); setJoinError(''); setJoinSuccess(false); }}
                    placeholder="XXXX-XXXX"
                    className="flex-1 bg-[#0d1117] text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-purple-500/50 focus:outline-none text-sm font-mono tracking-wider text-center placeholder-gray-600 uppercase"
                    maxLength={9}
                  />
                  <button
                    onClick={handleJoin}
                    disabled={inviteCode.length < 4 || isJoining}
                    className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none text-sm"
                  >
                    {isJoining ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Join'}
                  </button>
                </div>
                {joinError && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                    {joinError}
                  </p>
                )}
                {joinSuccess && (
                  <p className="text-sm text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Successfully joined! You can now view the shared entries.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Shared With Me</h3>
                {acceptedShares.length === 0 ? (
                  <div className="text-center py-8 bg-[#0d1117] rounded-xl border border-gray-800">
                    <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No shared collections yet</p>
                    <p className="text-xs text-gray-600 mt-1">Enter an invite code to view someone's entries</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {acceptedShares.map(share => (
                      <div key={share.shareCode} className="bg-[#0d1117] rounded-xl p-4 border border-gray-800 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{share.label}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Shared by <span className="text-purple-400">{share.ownerName}</span>
                            <span className="text-gray-600 ml-1">({share.ownerEmail})</span>
                          </p>
                          <p className="text-[11px] text-gray-600 mt-1">
                            Accepted {new Date(share.acceptedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveAccepted(share.shareCode)}
                          className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-400 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
