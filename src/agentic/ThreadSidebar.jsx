import React, { useState, useRef, useEffect } from 'react'
import { Plus, Search, MessageSquare, Trash2, X, User, LogOut, Settings, Bell, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import { groupByRecency } from './agenticStore'

const GROUP_LABELS = { today: 'Today', yesterday: 'Yesterday', thisWeek: 'This week', earlier: 'Earlier' }

export default function ThreadSidebar({
  threads, activeId, onPick, onNew, onDelete, onClose, mobile = false,
}) {
  const { profile, signOut, navigate } = useApp()
  const [q, setQ] = React.useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the profile popover when clicking outside.
  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const filtered = q
    ? threads.filter(t => t.title.toLowerCase().includes(q.toLowerCase()))
    : threads
  const groups = groupByRecency(filtered)

  return (
    <aside className={`flex flex-col bg-[#F4F6FA] h-full border-r border-bdr-light ${mobile ? 'w-[280px]' : ''}`}>
      {/* Header */}
      <div className="h-14 flex items-center gap-2 px-3 border-b border-bdr-light flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Logo size={28} />
          <div className="text-[14px] font-extrabold text-txt-primary truncate">Pravasi Setu</div>
        </div>
        {mobile && (
          <button onClick={onClose} className="w-9 h-9 rounded-full text-txt-secondary active:bg-surface-secondary flex items-center justify-center" aria-label="Close">
            <X size={18} />
          </button>
        )}
      </div>

      {/* New chat */}
      <div className="px-3 py-3 flex-shrink-0">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[13px] py-2.5 rounded-pill shadow-card transition-colors"
        >
          <Plus size={15} /> New chat
        </button>
        <div className="mt-2.5 flex items-center bg-white border border-bdr rounded-pill px-3 focus-within:border-primary">
          <Search size={14} className="text-txt-tertiary" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search chats"
            className="flex-1 py-2 px-2 text-[12px] outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        {threads.length === 0 && (
          <div className="px-3 py-10 text-center">
            <MessageSquare size={28} className="mx-auto text-txt-tertiary mb-2" />
            <div className="text-[12px] text-txt-secondary">No conversations yet.<br />Start a new chat above.</div>
          </div>
        )}
        {Object.entries(GROUP_LABELS).map(([key, label]) => {
          const list = groups[key]
          if (!list || list.length === 0) return null
          return (
            <div key={key} className="mt-2">
              <div className="px-2 py-1 text-[10px] font-bold text-txt-tertiary uppercase tracking-wide">{label}</div>
              <div className="space-y-0.5">
                {list.map(t => (
                  <ThreadRow
                    key={t.id}
                    thread={t}
                    active={t.id === activeId}
                    onPick={() => onPick(t.id)}
                    onDelete={() => onDelete(t.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer profile — clickable, opens a popover with Profile / Settings / Sign out */}
      <div className="border-t border-bdr-light flex-shrink-0 relative" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-bdr-light rounded-xl shadow-modal py-1 animate-fade-in">
            <MenuItem icon={User}     label="View Profile"    onClick={() => { setMenuOpen(false); navigate('profile') }} />
            <MenuItem icon={Bell}     label="Updates & Alerts" onClick={() => { setMenuOpen(false); navigate('updates') }} />
            <MenuItem icon={Settings} label="Settings"        onClick={() => { setMenuOpen(false); navigate('profile') }} />
            <div className="my-1 mx-3 h-px bg-bdr-light" />
            <MenuItem icon={LogOut}   label="Sign out"        danger onClick={() => { setMenuOpen(false); signOut?.() }} />
          </div>
        )}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className={`w-full p-3 flex items-center gap-2 transition-colors ${menuOpen ? 'bg-surface-secondary' : 'hover:bg-white'}`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">
            {profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PS'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12px] font-bold text-txt-primary truncate">{profile?.name || 'Guest'}</div>
            <div className="text-[10px] text-txt-secondary truncate">{profile?.location || 'India'}</div>
          </div>
          <ChevronUp size={14} className={`text-txt-tertiary transition-transform ${menuOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12.5px] font-semibold transition-colors ${
        danger ? 'text-danger hover:bg-danger-light' : 'text-txt-primary hover:bg-surface-secondary'
      }`}
    >
      <Icon size={14} className={danger ? 'text-danger' : 'text-txt-secondary'} />
      {label}
    </button>
  )
}

function ThreadRow({ thread, active, onPick, onDelete }) {
  return (
    <div className={`group relative flex items-center gap-2 rounded-lg pl-2 pr-1 transition-colors ${
      active ? 'bg-primary-light' : 'hover:bg-white'
    }`}>
      <button
        onClick={onPick}
        className="flex-1 min-w-0 py-2 text-left flex items-center gap-2"
      >
        <MessageSquare size={13} className={active ? 'text-primary flex-shrink-0' : 'text-txt-tertiary flex-shrink-0'} />
        <span className={`text-[12.5px] truncate ${active ? 'font-bold text-primary' : 'text-txt-primary'}`}>
          {thread.title}
        </span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full text-txt-tertiary hover:text-danger hover:bg-danger-light flex items-center justify-center flex-shrink-0 transition-opacity"
        aria-label="Delete chat"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
