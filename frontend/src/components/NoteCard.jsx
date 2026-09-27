import { Pin, Star, Archive, ArchiveRestore, Trash2, Globe } from 'lucide-react';

export default function NoteCard({
  note,
  onSelect,
  onTogglePin,
  onToggleFavourite,
  onToggleArchive,
  onDelete,
  onTagClick,
  viewMode = 'grid',
}) {
  const isPinned = !!note.isPinned;
  const isFavourite = !!note.isFavourite;
  const isArchived = !!note.isArchived;
  const isPublic = !!note.isPublic;

  // Format date cleanly
  const dateObj = new Date(note.updatedAt || note.createdAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  // Strip markdown characters for a clean card preview
  const plainText = (note.content || '')
    .replace(/[#*`~_>[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect(note)}
        className="group relative flex items-center justify-between p-3.5 rounded-xl bg-[#12151b]/80 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer hover:bg-[#161a22]"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note);
            }}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              isPinned ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'
            }`}
            title={isPinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-sky-400 rotate-45' : ''}`} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                {note.title}
              </h3>
              {isPublic && (
                <span className="p-0.5 rounded text-emerald-400" title="Public note">
                  <Globe className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">
              {plainText || <span className="italic text-slate-600">Empty note</span>}
            </p>
          </div>
        </div>

        {/* Tags and Meta */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {note.tags && note.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {note.tags.slice(0, 2).map((t) => (
                <span
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(t.name);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-amber-500/10 text-slate-400 hover:text-amber-300 text-[10px] font-mono-code transition-colors"
                >
                  #{t.name}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[10px] font-mono-code text-slate-600">
                  +{note.tags.length - 2}
                </span>
              )}
            </div>
          )}

          <span className="text-[11px] font-mono-code text-slate-500 shrink-0">
            {formattedDate}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(note);
              }}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                isFavourite ? 'text-amber-400' : 'text-slate-400'
              }`}
              title="Favorite"
            >
              <Star className={`w-3.5 h-3.5 ${isFavourite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleArchive(note);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              title={isArchived ? 'Unarchive' : 'Archive'}
            >
              {isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (modern card)
  return (
    <div
      onClick={() => onSelect(note)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl glass-card cursor-pointer overflow-hidden min-h-[190px]"
    >
      {/* Top action row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isPinned && (
              <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono-code flex items-center gap-1 shrink-0">
                <Pin className="w-2.5 h-2.5 fill-sky-400 rotate-45" />
                Pinned
              </span>
            )}
            {isPublic && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono-code flex items-center gap-1 shrink-0">
                <Globe className="w-2.5 h-2.5" />
                Public
              </span>
            )}
            {isArchived && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono-code shrink-0">
                Archived
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note);
              }}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-all ${
                isPinned ? 'text-sky-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300'
              }`}
              title={isPinned ? 'Unpin' : 'Pin note'}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-sky-400 rotate-45' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(note);
              }}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-all ${
                isFavourite ? 'text-amber-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300'
              }`}
              title={isFavourite ? 'Unfavorite' : 'Add to favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${isFavourite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-syne font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug mb-2">
          {note.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans font-normal">
          {plainText || <span className="italic text-slate-600">No additional text</span>}
        </p>
      </div>

      {/* Footer row: Tags & Date */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 min-w-0">
          {note.tags && note.tags.length > 0 ? (
            note.tags.slice(0, 2).map((t) => (
              <span
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(t.name);
                }}
                className="px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-amber-500/10 text-slate-400 hover:text-amber-300 text-[10px] font-mono-code transition-colors truncate max-w-[90px]"
              >
                #{t.name}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-mono-code text-slate-600">No tags</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono-code text-slate-500">
            {formattedDate}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
            title="Move to trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
