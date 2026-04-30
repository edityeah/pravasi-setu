import React, { useState } from 'react'
import { APPS, TONES } from './intentRouter'
import { Sparkles, Mic, Send, ChevronRight } from 'lucide-react'
import PartnerStrip from '../components/PartnerStrip'
import VoiceAgentButton from './voice/VoiceAgentButton'
import { useApp } from '../context/AppContext'

const STARTERS = [
  'Find electrician jobs in Dubai',
  'How much will migration to Saudi cost?',
  'Send ₹10,000 home',
  'My employer is not paying me',
  'What documents do I need before flying?',
  'Track my visa status',
]

// Empty / first-load state. Two-line greeting, an always-visible composer, a
// colourful app picker, suggested starters and the partner trust strip.
export default function WelcomeView({ profile, onStarter, onApp, onSend }) {
  const { showToast } = useApp()
  const firstName = profile?.name?.split(' ')[0] || 'there'
  const [val, setVal] = useState('')

  const submit = () => {
    const text = val.trim()
    if (!text || !onSend) return
    setVal('')
    onSend(text)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-6">
          {/* Greeting — broken to two lines so it reads cleanly at any width */}
          <div className="flex flex-col items-center text-center mb-9">
            <div className="text-[12px] font-bold text-primary uppercase tracking-[0.18em] mb-2">Setu Assistant</div>
            <h1 className="text-[30px] sm:text-[38px] font-extrabold text-txt-primary leading-[1.1]">
              Hi {firstName} <span className="inline-block">👋</span>,
              <br />
              what can I help with?
            </h1>
            <p className="text-[13px] text-txt-secondary mt-3 max-w-[480px]">
              Type below or pick an app — jobs, money transfers, documents, grievances. I'll surface the right tool inside this chat.
            </p>
            <div className="mt-5">
              <VoiceAgentButton label="Talk to Pravasi Setu Assistant" />
            </div>
          </div>

          {/* App picker — colour-toned tiles */}
          <div className="mb-9">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[11.5px] font-bold text-txt-secondary uppercase tracking-wide">Open an app</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {APPS.map(a => {
                const Icon = a.icon
                const tone = TONES[a.tone] || TONES.blue
                return (
                  <button
                    key={a.id}
                    onClick={() => onApp(a)}
                    className="group flex items-start gap-3 p-3 bg-white border border-bdr rounded-xl text-left hover:border-primary hover:-translate-y-0.5 hover:shadow-card transition-all"
                  >
                    <div className={`w-11 h-11 rounded-xl ${tone.bg} ${tone.fg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} strokeWidth={2.1} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-txt-primary truncate">{a.title}</div>
                      <div className="text-[10.5px] text-txt-secondary line-clamp-2 leading-snug">{a.summary}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Starters */}
          <div className="mb-8">
            <div className="text-[11.5px] font-bold text-txt-secondary uppercase tracking-wide mb-3">Try asking</div>
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

          {/* Partner trust strip */}
          <PartnerStrip className="mt-2" />
        </div>
      </div>

      {/* Composer — always visible, even on the welcome screen */}
      <div className="border-t border-bdr-light bg-white px-3 sm:px-5 py-3 flex-shrink-0">
        <div className="max-w-[760px] mx-auto flex items-end gap-2">
          <button
            onClick={() => showToast('Voice input — coming soon', 'info')}
            className="w-10 h-10 rounded-full bg-primary-light text-primary hover:bg-primary hover:text-white flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label="Voice"
          >
            <Mic size={16} />
          </button>
          <div className="flex-1 min-w-0 flex items-center bg-surface-secondary rounded-3xl px-4 focus-within:ring-2 focus-within:ring-primary/30">
            <textarea
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              rows={1}
              placeholder="Message Setu…"
              className="flex-1 py-2.5 text-[14px] leading-snug outline-none bg-transparent resize-none max-h-32 min-w-0 w-full block"
            />
          </div>
          <button
            onClick={submit}
            disabled={!val.trim()}
            className="w-10 h-10 rounded-full bg-primary text-white shadow-card flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-transform"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center text-[10px] text-txt-tertiary mt-1.5">
          Voice · Hindi · English · Malayalam · Tamil · Bengali · Odia
        </div>
      </div>
    </div>
  )
}
