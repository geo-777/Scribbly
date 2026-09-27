import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import {
  X,
  Pin,
  Star,
  Archive,
  ArchiveRestore,
  Trash2,
  Globe,
  Copy,
  Check,
  Download,
  Tag,
  Plus,
  Eye,
  Columns2,
  FileEdit,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

export default function NoteEditor({
  note,
  allTags = [],
  onClose,
  onSaveSuccess,
  onDelete,
  onTagsUpdated,
}) {
  const toast = useToast();

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedTagIds, setSelectedTagIds] = useState(
    note?.tags?.map((t) => t.id) || []
  );
  const [isPinned, setIsPinned] = useState(!!note?.isPinned);
  const [isFavourite, setIsFavourite] = useState(!!note?.isFavourite);
  const [isArchived, setIsArchived] = useState(!!note?.isArchived);
  const [isPublic, setIsPublic] = useState(!!note?.isPublic);

  const [viewTab, setViewTab] = useState('split'); // 'edit' | 'split' | 'preview'
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const [isCopied, setIsCopied] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const isNew = !note?.id;
  const isInitialMount = useRef(true);
  const autoSaveTimerRef = useRef(null);

  // Sync state if selected note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedTagIds(note.tags?.map((t) => t.id) || []);
      setIsPinned(!!note.isPinned);
      setIsFavourite(!!note.isFavourite);
      setIsArchived(!!note.isArchived);
      setIsPublic(!!note.isPublic);
      setSaveStatus('saved');
    }
  }, [note?.id]);

  // Handle escape key to close editor
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Core save function
  const saveNote = useCallback(
    async (overrideData = {}) => {
      const currentTitle = overrideData.title !== undefined ? overrideData.title : title;
      const currentContent = overrideData.content !== undefined ? overrideData.content : content;
      const currentTags = overrideData.tags !== undefined ? overrideData.tags : selectedTagIds;
      const currentPinned = overrideData.isPinned !== undefined ? overrideData.isPinned : isPinned;
      const currentFav = overrideData.isFavourite !== undefined ? overrideData.isFavourite : isFavourite;
      const currentArchived = overrideData.isArchived !== undefined ? overrideData.isArchived : isArchived;
      const currentPub = overrideData.isPublic !== undefined ? overrideData.isPublic : isPublic;

      if (!currentTitle.trim()) {
        return;
      }

      // Title must be min 3 chars as enforced by backend DTO
      if (currentTitle.trim().length < 3) {
        return;
      }

      try {
        setSaveStatus('saving');
        let savedNote;

        if (isNew) {
          // POST /notes
          savedNote = await api.notes.create({
            title: currentTitle.trim(),
            content: currentContent || ' ',
            tags: currentTags,
          });
          toast.success('Note created!');
          onSaveSuccess(savedNote, true);
        } else {
          // PATCH /notes/:id
          savedNote = await api.notes.update(note.id, {
            title: currentTitle.trim(),
            content: currentContent,
            tags: currentTags,
            isPinned: currentPinned,
            isFavourite: currentFav,
            isArchived: currentArchived,
            isPublic: currentPub,
          });
          setSaveStatus('saved');
          onSaveSuccess(savedNote, false);
        }
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus('unsaved');
      }
    },
    [
      title,
      content,
      selectedTagIds,
      isPinned,
      isFavourite,
      isArchived,
      isPublic,
      isNew,
      note?.id,
      toast,
      onSaveSuccess,
    ]
  );

  // Debounced auto-save for existing notes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isNew) return; // Don't auto-save completely empty new drafts

    setSaveStatus('unsaved');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveNote();
    }, 900);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, selectedTagIds, isPinned, isFavourite, isArchived, isPublic]);

  // Quick toggle handlers that save immediately
  const handleTogglePin = () => {
    const nextVal = !isPinned;
    setIsPinned(nextVal);
    if (!isNew) saveNote({ isPinned: nextVal });
  };

  const handleToggleFavourite = () => {
    const nextVal = !isFavourite;
    setIsFavourite(nextVal);
    if (!isNew) saveNote({ isFavourite: nextVal });
  };

  const handleToggleArchived = () => {
    const nextVal = !isArchived;
    setIsArchived(nextVal);
    if (!isNew) saveNote({ isArchived: nextVal });
    toast.info(nextVal ? 'Note moved to archive' : 'Note restored from archive');
  };

  const handleTogglePublic = () => {
    const nextVal = !isPublic;
    setIsPublic(nextVal);
    if (!isNew) saveNote({ isPublic: nextVal });
    toast.info(nextVal ? 'Public sharing enabled' : 'Public sharing disabled');
  };

  const handleCopyPublicLink = () => {
    if (!note?.id) return;
    const publicUrl = `${window.location.origin}/notes/public/${note.id}`;
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    toast.success('Public note link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown file exported!');
  };

  // Tag management
  const handleToggleTag = (tagId) => {
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(newTags);
    if (!isNew) saveNote({ tags: newTags });
  };

  const handleCreateNewTag = async (e) => {
    e.preventDefault();
    const name = newTagInput.trim().toLowerCase();
    if (!name) return;

    try {
      const createdTag = await api.tags.create({ name });
      setNewTagInput('');
      onTagsUpdated?.();
      // Auto attach to current note
      const updated = [...selectedTagIds, createdTag.id];
      setSelectedTagIds(updated);
      if (!isNew) saveNote({ tags: updated });
      toast.success(`Created & added tag #${name}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create tag');
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const parsedMarkdown = marked.parse(content || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[92vh] flex flex-col bg-[#0c0f15] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Top Control Bar */}
        <header className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#10131b]/90">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Close editor (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Auto-save status */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-slate-400">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-2 h-2 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span className="text-amber-300">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-400">Saved</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-amber-300">Unsaved changes</span>
                </>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5">
            {/* View mode buttons */}
            <div className="hidden md:flex items-center bg-[#161a22] border border-white/10 p-0.5 rounded-xl mr-2">
              <button
                onClick={() => setViewTab('edit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-code transition-colors flex items-center gap-1.5 ${
                  viewTab === 'edit' ? 'bg-white/10 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Raw</span>
              </button>
              <button
                onClick={() => setViewTab('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-code transition-colors flex items-center gap-1.5 ${
                  viewTab === 'split' ? 'bg-white/10 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewTab('preview')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-code transition-colors flex items-center gap-1.5 ${
                  viewTab === 'preview' ? 'bg-white/10 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Pin Button */}
            <button
              onClick={handleTogglePin}
              className={`p-2 rounded-xl border border-white/5 transition-colors ${
                isPinned ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={isPinned ? 'Unpin' : 'Pin note'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-sky-400 rotate-45' : ''}`} />
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavourite}
              className={`p-2 rounded-xl border border-white/5 transition-colors ${
                isFavourite ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={isFavourite ? 'Unfavorite' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavourite ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Public Link Share Toggle */}
            {!isNew && (
              <div className="relative flex items-center">
                <button
                  onClick={handleTogglePublic}
                  className={`p-2 rounded-xl border border-white/5 transition-colors ${
                    isPublic ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={isPublic ? 'Make private' : 'Share public note link'}
                >
                  <Globe className="w-4 h-4" />
                </button>
                {isPublic && (
                  <button
                    onClick={handleCopyPublicLink}
                    className="ml-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono-code hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                    title="Copy public link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Copy Link</span>
                  </button>
                )}
              </div>
            )}

            {/* Archive Button */}
            {!isNew && (
              <button
                onClick={handleToggleArchived}
                className={`p-2 rounded-xl border border-white/5 transition-colors ${
                  isArchived ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isArchived ? 'Restore from archive' : 'Archive note'}
              >
                {isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              </button>
            )}

            {/* Download Markdown */}
            <button
              onClick={handleDownloadMarkdown}
              className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Download as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Delete note */}
            {!isNew && (
              <button
                onClick={() => onDelete(note)}
                className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Move note to trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Save Button for new notes */}
            {isNew && (
              <button
                onClick={() => saveNote()}
                disabled={title.trim().length < 3}
                className="ml-2 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-syne font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-40 cursor-pointer"
              >
                Create Note
              </button>
            )}
          </div>
        </header>

        {/* Note Metadata & Tags bar */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#0f1218] flex flex-wrap items-center justify-between gap-3">
          {/* Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Tags:
            </span>

            {selectedTagIds.map((tagId) => {
              const tagObj = allTags.find((t) => t.id === tagId);
              if (!tagObj) return null;
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-code"
                >
                  <span>#{tagObj.name}</span>
                  <button
                    onClick={() => handleToggleTag(tagId)}
                    className="hover:text-rose-400 p-0.5 rounded"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}

            {/* Add Tag Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs font-mono-code flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Tag</span>
              </button>

              {isTagDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 p-2 rounded-xl bg-[#141820] border border-white/10 shadow-2xl z-30 animate-fade-in">
                  <form onSubmit={handleCreateNewTag} className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="New tag..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-[#0e1116] border border-white/10 text-xs font-mono-code text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newTagInput.trim()}
                      className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </form>

                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {allTags.length === 0 ? (
                      <p className="text-[11px] text-slate-500 font-mono-code text-center py-2">No tags yet</p>
                    ) : (
                      allTags.map((t) => {
                        const isSelected = selectedTagIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleToggleTag(t.id)}
                            className={`w-full text-left px-2 py-1 rounded-lg text-xs font-mono-code flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <span>#{t.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Word count & characters */}
          <div className="text-[11px] font-mono-code text-slate-500 flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{content.length} characters</span>
          </div>
        </div>

        {/* Title Input */}
        <div className="px-6 sm:px-10 pt-6 pb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (3–50 chars)..."
            maxLength={50}
            className="w-full bg-transparent font-syne text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight border-none p-0"
          />
          {title.trim().length > 0 && title.trim().length < 3 && (
            <p className="text-[11px] text-rose-400 font-mono-code mt-1">
              Title must be at least 3 characters
            </p>
          )}
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden p-6 sm:p-10 pt-2 gap-8">
          {/* Raw Markdown Editor Pane */}
          {(viewTab === 'edit' || viewTab === 'split') && (
            <div className="flex-1 flex flex-col h-full">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts in markdown... (supports # headings, - lists, `code`, **bold**, etc.)"
                maxLength={5000}
                className="w-full h-full bg-transparent text-slate-200 placeholder-slate-600 font-mono-code text-sm leading-relaxed resize-none focus:outline-none selection:bg-amber-500/20"
              />
            </div>
          )}

          {/* Divider in split mode */}
          {viewTab === 'split' && (
            <div className="w-[1px] bg-white/5 self-stretch hidden md:block" />
          )}

          {/* Live Markdown Preview Pane */}
          {(viewTab === 'preview' || viewTab === 'split') && (
            <div className="flex-1 overflow-y-auto pr-2 scribbly-prose">
              {content.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: parsedMarkdown }} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic text-sm">
                  Markdown preview will render here
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
