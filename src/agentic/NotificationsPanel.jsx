import React from 'react'
import { X, CheckCheck, Bell } from 'lucide-react'
import { NOTIFICATIONS } from '../data/mockData'
import { Briefcase, Plane, Wallet, AlertTriangle, MessageCircle } from 'lucide-react'

const ICONS = {
  job:     { icon: Briefcase,    color: 'bg-info-light text-info' },
  visa:    { icon: Plane,        color: 'bg-primary-light text-primary' },
  payment: { icon: Wallet,       color: 'bg-warn-light text-warn' },
  fraud:   { icon: AlertTriangle,color: 'bg-danger-light text-danger' },
  support: { icon: MessageCircle,color: 'bg-ok-light text-ok' },
}

export default function NotificationsPanel({ open, onClose }) {
  const [readIds, setReadIds] = React.useState(new Set())
  if (!open) return null

  const markAll = () => setReadIds(new Set(NOTIFICATIONS.map(n => n.id)))
  const markOne = (id) => setReadIds(prev => new Set([...prev, id]))
  const unread = NOTIFICATIONS.filter(n => !readIds.has(n.id)).length

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-white border-l border-bdr-light shadow-modal z-[70] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="h-14 flex items-center gap-2 px-3 border-b border-bdr-light flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-txt-primary">Notifications</div>
            <div className="text-[11px] text-txt-secondary">
              {unread > 0 ? `${unread} unread` : 'You\'re all caught up'}
            </div>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold text-primary hover:bg-primary-light flex items-center gap-1"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-surface-secondary text-txt-secondary flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {NOTIFICATIONS.map(n => {
            const meta = ICONS[n.kind] || ICONS.support
            const Icon = meta.icon
            const isRead = readIds.has(n.id)
            return (
              <button
                key={n.id}
                onClick={() => markOne(n.id)}
                className={`w-full text-left bg-white rounded-xl p-3 shadow-card flex items-start gap-3 border transition-colors ${
                  n.urgent ? 'border-l-4 border-l-danger border-y-bdr-light border-r-bdr-light' : 'border-bdr-light'
                } ${!isRead ? 'bg-primary-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`text-[12.5px] font-bold ${isRead ? 'text-txt-secondary' : 'text-txt-primary'}`}>{n.title}</div>
                    {!isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <div className="text-[11px] text-txt-secondary leading-snug mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-txt-tertiary mt-1">{n.time}</div>
                </div>
                {n.urgent && (
                  <span className="px-2 py-0.5 bg-danger text-white text-[9px] font-bold rounded-full flex-shrink-0">URGENT</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
