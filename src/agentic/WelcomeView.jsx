import React from 'react'
import Logo from '../components/Logo'
import { APPS } from './intentRouter'
import { Sparkles, Mic, ChevronRight } from 'lucide-react'

const STARTERS = [
  'Find electrician jobs in Dubai',
  'How much will migration to Saudi cost?',
  'Send ₹10,000 home',
  'My employer is not paying me',
  'What documents do I need before flying?',
  'Track my visa status',
]

// Empty / first-load state for the center pane. Big greeting, app picker grid,
// suggested starter prompts, all of which seed the first message.
export default function WelcomeView({ profile, onStarter, onApp }) {
  const firstName = profile?.name?.split(' ')[0] || 'there'

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-10 sm:py-16">
        {/* Greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <div className="mt-4 text-[14px] font-semibold text-primary uppercase tracking-wider">Setu Assistant</div>
          <h1 className="text-[28px] sm:text-[34px] font-extrabold text-txt-primary mt-1 leading-tight">
            Hi {firstName} 👋, what can I help with?
          </h1>
          <p className="text-[13px] text-txt-secondary mt-2 max-w-[480px]">
            Ask anything about your migration journey — jobs, money transfers, documents, grievances. I'll bring up the right tool inside this chat.
          </p>
        </div>

        {/* App picker */}
        <div className="mt-2">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={14} className="text-primary" />
            <span className="text-[12px] font-bold text-txt-secondary uppercase tracking-wide">Open an app</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {APPS.map(a => {
              const Icon = a.icon
              return (
                <button
                  key={a.id}
                  onClick={() => onApp(a)}
                  className="group flex items-start gap-3 p-3 bg-white border border-bdr rounded-xl text-left hover:border-primary hover:-translate-y-0.5 hover:shadow-card transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-txt-primary truncate">{a.title}</div>
                    <div className="text-[10.5px] text-txt-secondary line-clamp-2 leading-snug">{a.summary}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Starters */}
        <div className="mt-8">
          <div className="text-[12px] font-bold text-txt-secondary uppercase tracking-wide mb-3">Try asking</div>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map(s => (
              <button
                key={s}
                onClick={() => onStarter(s)}
                className="px-3.5 py-2 bg-surface-secondary hover:bg-primary-light text-[12px] font-semibold text-txt-primary hover:text-primary rounded-full transition-colors flex items-center gap-1.5"
              >
                {s} <ChevronRight size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Voice hint */}
        <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-txt-tertiary">
          <Mic size={12} /> Voice input · Hindi · English · Malayalam · Tamil · Bengali · Odia
        </div>
      </div>
    </div>
  )
}
