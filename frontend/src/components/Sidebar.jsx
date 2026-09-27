import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Feather,
  Plus,
  BookOpen,
  Star,
  Pin,
  Archive,
  Trash2,
  Tag,
  LogOut,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react';

export default function Sidebar({
  tags = [],
  trashCount = 0,
  onOpenTagModal,
  onNewNote,
  isOpen = false,
  onClose = () => {},
}) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentFilter = searchParams.get('filter') || '';
  const currentTag = searchParams.get('tag') || '';
  const isTrashRoute = location.pathname.startsWith('/trash');

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out of Scribbly');
      navigate('/login');
    } catch (err) {
      toast.error('Logout error');
    }
  };

  const navItems = [
    {
      label: 'All Notes',
      icon: BookOpen,
      to: '/',
      active: location.pathname === '/' && !currentFilter && !currentTag,
    },
    {
      label: 'Favorites',
      icon: Star,
      to: '/?filter=favourite',
      active: currentFilter === 'favourite',
      color: 'text-amber-400',
    },
    {
      label: 'Pinned',
      icon: Pin,
      to: '/?filter=pinned',
      active: currentFilter === 'pinned',
      color: 'text-sky-400',
    },
    {
      label: 'Archive',
      icon: Archive,
      to: '/?filter=archived',
      active: currentFilter === 'archived',
      color: 'text-purple-400',
    },
    {
      label: 'Trash',
      icon: Trash2,
      to: '/trash',
      active: isTrashRoute,
      badge: trashCount > 0 ? trashCount : null,
      color: 'text-rose-400',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a0c10] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={onClose} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-amber-500/10">
                <Feather className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-syne text-lg font-bold tracking-tight text-white leading-none">
                  Scribbly<span className="text-amber-400">.</span>
                </span>
                <span className="text-[10px] font-mono-code text-slate-500 tracking-wider uppercase mt-0.5">
                  Notebook
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Note Action */}
          <button
            onClick={() => {
              onNewNote();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-syne font-bold text-xs flex items-center justify-between shadow-lg shadow-amber-500/15 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono-code font-normal">
              ⌘N
            </kbd>
          </button>

          {/* Main Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    item.active
                      ? 'bg-amber-500/10 border border-amber-500/25 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.color || ''}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono-code border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tags Section */}
        <div className="flex-1 px-5 overflow-y-auto min-h-0 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-slate-500 font-semibold">
              Tags
            </span>
            <button
              onClick={onOpenTagModal}
              className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
              title="Manage tags"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {tags.length === 0 ? (
              <p className="text-[11px] text-slate-600 font-mono-code py-2">No tags yet</p>
            ) : (
              tags.map((t) => {
                const isSelected = currentTag === t.name;
                return (
                  <Link
                    key={t.id}
                    to={`/?tag=${encodeURIComponent(t.name)}`}
                    onClick={onClose}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono-code transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">#{t.name}</span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-white/5 bg-[#08090d]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-amber-300 font-syne font-bold text-xs shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                  {user?.username || 'Writer'}
                </p>
                <p className="text-[10px] font-mono-code text-slate-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
