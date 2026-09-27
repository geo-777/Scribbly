import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Trash2, RotateCcw, AlertTriangle, Calendar, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TrashView({ onTrashUpdated }) {
  const toast = useToast();
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operatingId, setOperatingId] = useState(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const data = await api.trash.list();
      setTrashedNotes(data || []);
      onTrashUpdated?.((data || []).length);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch trash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestoreOne = async (id, title) => {
    try {
      setOperatingId(id);
      await api.trash.restore(id);
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.8 },
      });
      toast.success(`Restored "${title}"`);
      await fetchTrash();
    } catch (err) {
      toast.error(err.message || 'Failed to restore note');
    } finally {
      setOperatingId(null);
    }
  };

  const handleClearOne = async (id, title) => {
    if (!confirm(`Permanently delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setOperatingId(id);
      await api.trash.clear(id);
      toast.info(`Permanently deleted "${title}"`);
      await fetchTrash();
    } catch (err) {
      toast.error(err.message || 'Failed to delete note');
    } finally {
      setOperatingId(null);
    }
  };

  const handleRestoreAll = async () => {
    if (trashedNotes.length === 0) return;
    try {
      setLoading(true);
      await api.trash.restore(); // null restores all
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
      toast.success('All notes restored successfully!');
      await fetchTrash();
    } catch (err) {
      toast.error(err.message || 'Failed to restore notes');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (trashedNotes.length === 0) return;
    if (!confirm('Are you sure you want to permanently delete all notes in the trash?')) {
      return;
    }
    try {
      setLoading(true);
      await api.trash.clear(); // null clears all
      toast.info('Trash emptied permanently');
      await fetchTrash();
    } catch (err) {
      toast.error(err.message || 'Failed to clear trash');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-mono-code text-xs uppercase tracking-wider">Loading trash bin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-syne font-bold text-sm text-amber-200">
              Trash Repository
            </h4>
            <p className="text-xs text-amber-300/80 font-sans mt-0.5">
              Items in the trash can be restored back to your notebook or permanently eliminated.
            </p>
          </div>
        </div>

        {trashedNotes.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleRestoreAll}
              className="px-3 py-1.5 rounded-xl bg-[#161a22] border border-white/10 text-white text-xs font-mono-code hover:border-emerald-500/40 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore All</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono-code hover:bg-rose-500/25 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          </div>
        )}
      </div>

      {/* Trashed items list */}
      {trashedNotes.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-600 mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="font-syne text-lg font-bold text-slate-300 mb-1">
            Trash bin is empty
          </h3>
          <p className="text-slate-500 text-xs max-w-sm font-sans">
            Deleted notes will appear here. You can safely restore them whenever you want.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trashedNotes.map((note) => {
            const isBusy = operatingId === note.id;
            const deletedDate = note.deletedAt
              ? new Date(note.deletedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently';

            return (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-[#12151b] border border-white/5 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deleted {deletedDate}
                    </span>
                  </div>

                  <h3 className="font-syne font-bold text-base text-slate-200 line-clamp-1 mb-2">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans">
                    {note.content?.replace(/[#*`~_>[\]()]/g, '') || (
                      <span className="italic text-slate-600">Empty note</span>
                    )}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleRestoreOne(note.id, note.title)}
                    disabled={isBusy}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono-code hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    title="Restore to notebook"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => handleClearOne(note.id, note.title)}
                    disabled={isBusy}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono-code hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
