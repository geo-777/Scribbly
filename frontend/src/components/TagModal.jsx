import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function TagModal({ isOpen, onClose, onTagsUpdated, tags = [] }) {
  const toast = useToast();
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTag) {
      setEditName(editingTag.name);
    }
  }, [editingTag]);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newTagName.trim().toLowerCase();
    if (!name) return;

    try {
      setSubmitting(true);
      await api.tags.create({ name });
      toast.success(`Tag #${name} created!`);
      setNewTagName('');
      onTagsUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to create tag');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTag) return;
    const name = editName.trim().toLowerCase();
    if (!name || name === editingTag.name) {
      setEditingTag(null);
      return;
    }

    try {
      setSubmitting(true);
      await api.tags.update(editingTag.id, { name });
      toast.success(`Tag updated to #${name}!`);
      setEditingTag(null);
      onTagsUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to update tag');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete tag #${name}? Notes will keep their contents, only the tag association is removed.`)) {
      return;
    }

    try {
      setSubmitting(true);
      await api.tags.delete(id);
      toast.info(`Tag #${name} deleted`);
      onTagsUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to delete tag');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl border border-white/10 relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="font-syne font-bold text-lg text-white">Manage Tags</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create new tag input */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name (e.g. design, books)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0e1116] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 text-sm font-mono-code"
          />
          <button
            type="submit"
            disabled={submitting || !newTagName.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-syne font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Tags list */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {tags.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-500 font-mono-code">No tags created yet.</p>
          ) : (
            tags.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
              >
                {editingTag?.id === t.id ? (
                  <form onSubmit={handleUpdate} className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1 px-2.5 py-1 rounded-lg bg-[#0e1116] border border-amber-400/60 text-xs font-mono-code text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTag(null)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="font-mono-code text-xs text-amber-300">#{t.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTag(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                        title="Rename tag"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete tag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
