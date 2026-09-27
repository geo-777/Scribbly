import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { marked } from 'marked';
import { Feather, Calendar, Clock, Globe, ArrowLeft, Tag } from 'lucide-react';

export default function PublicNotePage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPublicNote() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.notes.getPublic(id);
        setNote(data);
      } catch (err) {
        setError(err.message || 'This note is not public or does not exist.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadPublicNote();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b0e] flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono-code text-xs tracking-wider uppercase">Loading public note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#090b0e] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <Globe className="w-6 h-6" />
        </div>
        <h1 className="font-syne text-2xl font-bold text-white mb-2">Note Not Found</h1>
        <p className="text-slate-400 max-w-sm mb-6 text-sm">{error || 'This note might be private or deleted.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161a22] border border-white/10 text-white text-sm hover:border-amber-500/40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Scribbly</span>
        </Link>
      </div>
    );
  }

  // Calculate estimated reading time
  const wordCount = (note.content || '').trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const parsedHtml = marked.parse(note.content || '');

  return (
    <div className="min-h-screen bg-[#080a0d] text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 relative">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

      {/* Top navigation bar */}
      <header className="w-full max-w-3xl flex items-center justify-between pb-8 mb-8 border-b border-white/10 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Feather className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-syne font-bold text-lg text-white">
            Scribbly<span className="text-amber-400">.</span>
          </span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-code text-slate-400">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Public Document</span>
        </div>
      </header>

      {/* Main note body */}
      <article className="w-full max-w-3xl glass-panel p-8 sm:p-12 rounded-2xl relative z-10 shadow-2xl">
        <div className="mb-6 space-y-4">
          <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {note.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-code text-slate-400 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {new Date(note.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {readingTime} min read ({wordCount} words)
            </span>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {note.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono-code"
                >
                  <Tag className="w-3 h-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Markdown Rendered Content */}
        <div
          className="scribbly-prose mt-8 text-base sm:text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      </article>

      {/* Footer call to action */}
      <footer className="w-full max-w-3xl mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <span>Published with Scribbly — The thoughtful notes application</span>
        <Link
          to="/register"
          className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          Create your own notes &rarr;
        </Link>
      </footer>
    </div>
  );
}
