import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { EntryEditor } from './components/EntryEditor';
import { EntryViewer } from './components/EntryViewer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BlogEntry, SAMPLE_ENTRIES, View } from './types';
import { Menu, X } from 'lucide-react';

export function App() {
  const [entries, setEntries] = useLocalStorage<BlogEntry[]>('codelog-entries', SAMPLE_ENTRIES);
  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<BlogEntry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedEntry = entries.find((e) => e.id === selectedId) || null;

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedId(id);
    setCurrentView('detail');
    setEditingEntry(null);
    // On mobile, close sidebar
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleNewEntry = useCallback(() => {
    setCurrentView('new');
    setEditingEntry(null);
    setSelectedId(null);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleEditEntry = useCallback(() => {
    if (selectedEntry) {
      setEditingEntry(selectedEntry);
      setCurrentView('edit');
    }
  }, [selectedEntry]);

  const handleSaveEntry = useCallback(
    (data: Omit<BlogEntry, 'id' | 'createdAt'>) => {
      if (editingEntry) {
        // Update existing
        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingEntry.id
              ? { ...e, ...data }
              : e
          )
        );
        setSelectedId(editingEntry.id);
        setCurrentView('detail');
        setEditingEntry(null);
      } else {
        // Create new
        const newEntry: BlogEntry = {
          ...data,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          createdAt: Date.now(),
        };
        setEntries((prev) => [newEntry, ...prev]);
        setSelectedId(newEntry.id);
        setCurrentView('detail');
      }
    },
    [editingEntry, setEntries]
  );

  const handleDeleteEntry = useCallback(
    (id: string) => {
      if (window.confirm('Delete this entry? This cannot be undone.')) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
          setCurrentView('feed');
        }
      }
    },
    [selectedId, setEntries]
  );

  const handleCancel = useCallback(() => {
    if (editingEntry) {
      setSelectedId(editingEntry.id);
      setCurrentView('detail');
      setEditingEntry(null);
    } else {
      setCurrentView(selectedId ? 'detail' : 'feed');
    }
  }, [editingEntry, selectedId]);

  return (
    <div className="h-screen flex bg-[#0d1117] text-white overflow-hidden">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-[#161b22] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-40 w-[300px] h-full transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          entries={entries}
          selectedId={selectedId}
          onSelect={handleSelectEntry}
          onNew={handleNewEntry}
          onDelete={handleDeleteEntry}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-hidden">
        {currentView === 'feed' && (
          <WelcomeScreen onNewEntry={handleNewEntry} entryCount={entries.length} />
        )}

        {currentView === 'new' && (
          <EntryEditor onSave={handleSaveEntry} onCancel={handleCancel} />
        )}

        {currentView === 'edit' && editingEntry && (
          <EntryEditor
            entry={editingEntry}
            onSave={handleSaveEntry}
            onCancel={handleCancel}
          />
        )}

        {currentView === 'detail' && selectedEntry && (
          <EntryViewer entry={selectedEntry} onEdit={handleEditEntry} />
        )}

        {currentView === 'detail' && !selectedEntry && (
          <WelcomeScreen onNewEntry={handleNewEntry} entryCount={entries.length} />
        )}
      </div>
    </div>
  );
}
