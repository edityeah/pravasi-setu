import React from 'react'
import { Home, Briefcase, MessageCircle, Bell, User } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useIsEmbedded } from '../agentic/EmbeddedContext'

const TABS = [
  { id: 'home',     Icon: Home,          label: 'Home' },
  { id: 'jobs',     Icon: Briefcase,     label: 'Jobs' },
  { id: 'chat',     Icon: MessageCircle, label: 'Assistant', center: true },
  { id: 'updates',  Icon: Bell,          label: 'Updates', badge: 3 },
  { id: 'profile',  Icon: User,          label: 'Profile' },
]

export default function BottomNav() {
  const { screen, navigate } = useApp()
  // Inside the agentic canvas the chat shell owns navigation — the per-page
  // bottom tabs would be redundant and steal space.
  const embedded = useIsEmbedded()
  if (embedded) return null

  return (
    <div className="border-t border-bdr-light flex-shrink-0 bg-white shadow-bottom">
      <div className="h-16 flex items-stretch max-w-screen-md mx-auto w-full relative">
        {TABS.map(tab => {
          const active = screen === tab.id
          const { Icon } = tab
          if (tab.center) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className="flex-1 flex flex-col items-center justify-center relative -mt-5"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-modal transition-all ${
                  active ? 'bg-accent' : 'bg-primary'
                }`}>
                  <Icon size={22} className="text-white" strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-semibold mt-1 ${active ? 'text-accent' : 'text-primary'}`}>
                  {tab.label}
                </span>
              </button>
            )
          }
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative min-w-[44px]"
            >
              <Icon size={20} className={active ? 'text-primary' : 'text-txt-tertiary'} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-txt-tertiary'}`}>
                {tab.label}
              </span>
              {tab.badge && !active && (
                <span className="absolute top-2 right-3 min-w-[16px] h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center px-1 border-2 border-white">
                  {tab.badge}
                </span>
              )}
              {active && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
