import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import TagModal from '../components/TagModal';
import TrashView from '../components/TrashView';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Plus, BookOpen, Search } from 'lucide-react';

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const searchParams = new URLSearchParams(location.search);
  const currentFilter = searchParams.get('filter') || '';
  const currentTag = searchParams.get('tag') || '';
  const isTrashView = location.pathname.startsWith('/trash');

  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');

  const [activeEditingNote, setActiveEditingNote] = useState(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch tags
  const fetchTags = useCallback(async () => {
    try {
      const data = await api.tags.list();
      setTags(data || []);
    } catch (_err) {
      // ignore
    }
  }, []);

  // Fetch trash count for sidebar badge
  const fetchTrashCount = useCallback(async () => {
    try {
      const data = await api.trash.list();
      setTrashCount((data || []).length);
    } catch {
      // ignore badge failure
    }
  }, []);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (isTrashView) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {};

      if (currentFilter === 'favourite') {
        params.favourite = true;
      } else if (currentFilter === 'pinned') {
        params.pinned = true;
      } else if (currentFilter === 'archived') {
        params.archived = true;
      } else {
        // By default, exclude archived notes from the main feed
        params.archived = false;
      }

      if (currentTag) {
        params.tag = currentTag;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const data = await api.notes.list(params);
      setNotes(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [currentFilter, currentTag, searchTerm, isTrashView, toast]);

  // Initial load & dependency updates
  useEffect(() => {
    fetchTags();
    fetchTrashCount();
  }, [fetchTags, fetchTrashCount]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Note actions
  const handleNewNote = useCallback(() => {
    setActiveEditingNote({
      title: '',
      content: '',
      tags: currentTag ? tags.filter((t) => t.name === currentTag) : [],
      isPinned: currentFilter === 'pinned',
      isFavourite: currentFilter === 'favourite',
      isArchived: currentFilter === 'archived',
      isPublic: false,
    });
  }, [currentTag, tags, currentFilter]);

  // Global keyboard shortcuts (Cmd+N for new note)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewNote]);

  const handleSelectNote = (note) => {
    setActiveEditingNote(note);
  };

  const handleTogglePin = async (note) => {
    const nextVal = !note.isPinned;
    // Optimistic UI update
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, isPinned: nextVal } : n))
    );
    try {
      await api.notes.update(note.id, { isPinned: nextVal });
    } catch (_err) {
      toast.error('Failed to update pin');
      fetchNotes();
    }
  };

  const handleToggleFavourite = async (note) => {
    const nextVal = !note.isFavourite;
    // Optimistic UI update
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, isFavourite: nextVal } : n))
    );
    try {
      await api.notes.update(note.id, { isFavourite: nextVal, isFavorite: nextVal });
    } catch (_err) {
      toast.error('Failed to update favorite');
      fetchNotes();
    }
  };

  const handleToggleArchive = async (note) => {
    const nextVal = !note.isArchived;
    // Remove or update from list
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    try {
      await api.notes.update(note.id, { isArchived: nextVal });
      toast.info(nextVal ? 'Note moved to archive' : 'Note restored');
    } catch (_err) {
      toast.error('Failed to archive note');
      fetchNotes();
    }
  };

  const handleDeleteNote = async (note) => {
    // Soft delete
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    setTrashCount((c) => c + 1);
    try {
      await api.notes.delete(note.id);
      toast.info(`Moved "${note.title}" to trash`);
    } catch (_err) {
      toast.error('Failed to delete note');
      fetchNotes();
      fetchTrashCount();
    }
  };

  const handleSaveSuccess = (savedNote, isNewNote) => {
    if (isNewNote) {
      setNotes((prev) => [savedNote, ...prev]);
      setActiveEditingNote(savedNote);
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === savedNote.id ? savedNote : n))
      );
    }
  };

  // Sort notes
  const sortedNotes = useMemo(() => {
    const copy = [...notes];
    return copy.sort((a, b) => {
      // Always bubble pinned to the very top in main feed
      if (!currentFilter && a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // 'updated' default
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
  }, [notes, sortBy, currentFilter]);

  // Derive dynamic page titles
  const viewTitle = isTrashView
    ? 'Trash Repository'
    : currentFilter === 'favourite'
    ? 'Favorite Notes'
    : currentFilter === 'pinned'
    ? 'Pinned Notes'
    : currentFilter === 'archived'
    ? 'Archived Vault'
    : currentTag
    ? `#${currentTag}`
    : 'All Notes';

  const viewSubtitle = isTrashView
    ? 'Soft-deleted notes ready to restore or wipe'
    : currentTag
    ? `Filtered notes labeled #${currentTag}`
    : currentFilter === 'favourite'
    ? 'Important notes you have starred'
    : currentFilter === 'pinned'
    ? 'Key notes anchored to the top'
    : currentFilter === 'archived'
    ? 'Stored and preserved references'
    : 'All documents in your personal workspace';

  return (
    <div className="min-h-screen bg-[#090b0e] flex relative">
      {/* Sidebar */}
      <Sidebar
        tags={tags}
        trashCount={trashCount}
        onOpenTagModal={() => setIsTagModalOpen(true)}
        onNewNote={handleNewNote}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header
          title={viewTitle}
          subtitle={viewSubtitle}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          noteCount={isTrashView ? trashCount : sortedNotes.length}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {isTrashView ? (
            <TrashView
              onTrashUpdated={(count) => {
                setTrashCount(count);
                fetchTrashCount();
              }}
            />
          ) : loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-500">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-mono-code text-xs uppercase tracking-wider">Loading notes...</p>
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                {searchTerm ? <Search className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
              </div>
              <h3 className="font-syne text-xl font-bold text-slate-200 mb-1">
                {searchTerm ? 'No matching notes found' : 'Your page is blank'}
              </h3>
              <p className="text-slate-400 text-xs max-w-sm mb-6 font-sans">
                {searchTerm
                  ? `No notes match "${searchTerm}". Try a different keyword.`
                  : 'Start capturing your thoughts, ideas, lists, and projects today.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNewNote}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-syne font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Note</span>
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'
                  : 'flex flex-col gap-2.5'
              }
            >
              {sortedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onSelect={handleSelectNote}
                  onTogglePin={handleTogglePin}
                  onToggleFavourite={handleToggleFavourite}
                  onToggleArchive={handleToggleArchive}
                  onDelete={handleDeleteNote}
                  onTagClick={(tagName) => navigate(`/?tag=${encodeURIComponent(tagName)}`)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Note Editor Overlay Modal */}
      {activeEditingNote && (
        <NoteEditor
          note={activeEditingNote}
          allTags={tags}
          onClose={() => setActiveEditingNote(null)}
          onSaveSuccess={handleSaveSuccess}
          onDelete={(note) => {
            handleDeleteNote(note);
            setActiveEditingNote(null);
          }}
          onTagsUpdated={fetchTags}
        />
      )}

      {/* Tag Management Modal */}
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onTagsUpdated={() => {
          fetchTags();
          fetchNotes();
        }}
        tags={tags}
      />
    </div>
  );
}
