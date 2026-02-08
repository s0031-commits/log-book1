import { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { EntryEditor } from './components/EntryEditor';
import { EntryViewer } from './components/EntryViewer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ShareModal } from './components/ShareModal';
import { SharedEntryViewer } from './components/SharedEntryViewer';
import { useEntries } from './hooks/useEntries';
import { useSharing } from './hooks/useSharing';
import { BlogEntry, View } from './types';
import { Menu, X } from 'lucide-react';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const { entries, addEntry, updateEntry, deleteEntry } = useEntries(user?.id ?? null);
  const {
    myShares,
    acceptedShares,
    createShare,
    revokeShare,
    acceptInvite,
    getSharedEntries,
    removeAcceptedShare,
    refreshShareData,
  } = useSharing(user?.id ?? null);

  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<BlogEntry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeSharedCode, setActiveSharedCode] = useState<string | null>(null);
  const [sharedEntries, setSharedEntries] = useState<BlogEntry[]>([]);

  const selectedEntry = entries.find(e => e.id === selectedId) || null;

  // Refresh shared data when entries change
  useEffect(() => {
    if (entries.length > 0) {
      refreshShareData(entries);
    }
  }, [entries, refreshShareData]);

  // Load shared entries when viewing a share
  useEffect(() => {
    if (activeSharedCode) {
      getSharedEntries(activeSharedCode).then(setSharedEntries);
    } else {
      setSharedEntries([]);
    }
  }, [activeSharedCode, getSharedEntries]);

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedId(id);
    setCurrentView('detail');
    setEditingEntry(null);
    setActiveSharedCode(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleNewEntry = useCallback(() => {
    setCurrentView('new');
    setEditingEntry(null);
    setSelectedId(null);
    setActiveSharedCode(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleEditEntry = useCallback(() => {
    if (selectedEntry) {
      setEditingEntry(selectedEntry);
      setCurrentView('edit');
    }
  }, [selectedEntry]);

  const handleSaveEntry = useCallback(async (data: {
    title: string;
    language: BlogEntry['language'];
    code: string;
    summary: string;
    reflection: string;
    tags: string[];
    date: string;
  }) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, data);
      setSelectedId(editingEntry.id);
      setCurrentView('detail');
      setEditingEntry(null);
    } else {
      const newEntry = await addEntry(data);
      if (newEntry) {
        setSelectedId(newEntry.id);
        setCurrentView('detail');
      }
    }
  }, [editingEntry, updateEntry, addEntry]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      await deleteEntry(id);
      if (selectedId === id) {
        setSelectedId(null);
        setCurrentView('feed');
      }
    }
  }, [selectedId, deleteEntry]);

  const handleCancel = useCallback(() => {
    if (editingEntry) {
      setSelectedId(editingEntry.id);
      setCurrentView('detail');
      setEditingEntry(null);
    } else {
      setCurrentView(selectedId ? 'detail' : 'feed');
    }
  }, [editingEntry, selectedId]);

  const handleViewSharedEntry = useCallback((code: string) => {
    setActiveSharedCode(code);
    setSelectedId(null);
    setCurrentView('shared-detail');
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleCreateShare = useCallback(async (entryIds: string[], label: string) => {
    if (!user) return null;
    return createShare(entryIds, user.displayName, user.email, label, entries);
  }, [user, createShare, entries]);

  const handleOpenShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading CodeLog...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const activeShare = acceptedShares.find(s => s.shareCode === activeSharedCode);

  return (
    <div className="h-screen flex bg-[#0d1117] text-white overflow-hidden">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-[#161b22] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 w-[300px] h-full transition-transform duration-300 ease-in-out`}>
        <Sidebar
          user={user}
          entries={entries}
          selectedId={selectedId}
          acceptedShares={acceptedShares}
          onSelect={handleSelectEntry}
          onNew={handleNewEntry}
          onDelete={handleDeleteEntry}
          onOpenShare={handleOpenShare}
          onLogout={logout}
          onViewSharedEntry={handleViewSharedEntry}
          activeSharedCode={activeSharedCode}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-hidden">
        {currentView === 'feed' && (
          <WelcomeScreen
            onNewEntry={handleNewEntry}
            onOpenShare={handleOpenShare}
            entryCount={entries.length}
            userName={user.displayName.split(' ')[0]}
          />
        )}

        {currentView === 'new' && (
          <EntryEditor onSave={handleSaveEntry} onCancel={handleCancel} />
        )}

        {currentView === 'edit' && editingEntry && (
          <EntryEditor entry={editingEntry} onSave={handleSaveEntry} onCancel={handleCancel} />
        )}

        {currentView === 'detail' && selectedEntry && (
          <EntryViewer
            entry={selectedEntry}
            onEdit={handleEditEntry}
            onShare={handleOpenShare}
          />
        )}

        {currentView === 'detail' && !selectedEntry && (
          <WelcomeScreen
            onNewEntry={handleNewEntry}
            onOpenShare={handleOpenShare}
            entryCount={entries.length}
            userName={user.displayName.split(' ')[0]}
          />
        )}

        {currentView === 'shared-detail' && activeShare && (
          <SharedEntryViewer share={activeShare} entries={sharedEntries} />
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          entries={entries}
          myShares={myShares}
          acceptedShares={acceptedShares}
          onCreateShare={handleCreateShare}
          onRevokeShare={revokeShare}
          onAcceptInvite={acceptInvite}
          onRemoveAccepted={removeAcceptedShare}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
