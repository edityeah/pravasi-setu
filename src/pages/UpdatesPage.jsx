import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { NOTIFICATIONS } from '../data/mockData'
import { Briefcase, Plane, Wallet, AlertTriangle, MessageCircle } from 'lucide-react'

const ICONS = {
  job:     { icon: Briefcase,    color: 'bg-info-light text-info' },
  visa:    { icon: Plane,        color: 'bg-primary-light text-primary' },
  payment: { icon: Wallet,       color: 'bg-warn-light text-warn' },
  fraud:   { icon: AlertTriangle,color: 'bg-danger-light text-danger' },
  support: { icon: MessageCircle,color: 'bg-ok-light text-ok' },
}

export default function UpdatesPage() {
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="Updates & Alerts" />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="max-w-screen-md mx-auto w-full space-y-2">
          {NOTIFICATIONS.map(n => {
            const meta = ICONS[n.kind] || ICONS.support
            const Icon = meta.icon
            return (
              <div key={n.id} className={`bg-white rounded-card p-3 shadow-card flex items-start gap-3 ${n.urgent ? 'border-l-4 border-danger' : ''}`}>
                <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-txt-primary">{n.title}</div>
                  <div className="text-[11px] text-txt-secondary leading-snug mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-txt-tertiary mt-1">{n.time}</div>
                </div>
                {n.urgent && (
                  <span className="px-2 py-0.5 bg-danger text-white text-[9px] font-bold rounded-full">URGENT</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="max-w-screen-md mx-auto mt-5 bg-primary-light rounded-card p-4">
          <div className="text-[12px] font-bold text-primary mb-1">🔔 Notification preferences</div>
          <p className="text-[11px] text-txt-secondary">Get alerts in Hindi or English. Voice playback for low-literacy users.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
