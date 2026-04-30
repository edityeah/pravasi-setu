import React, { useRef, useEffect } from 'react'
import { Mic, Send, Bot, ChevronRight, PanelRight, Bell, Phone } from 'lucide-react'
import { getAppById } from './intentRouter'
import Logo from '../components/Logo'
import { useApp } from '../context/AppContext'
import { useVoiceCall } from './voice/VoiceCallProvider'

// Center column: thread of messages + composer at bottom. Bot messages can
// carry one or more `canvasInvocations` — buttons the user can click to open
// the corresponding app inside the right canvas.

export default function ChatThread({ thread, onSend, onOpenApp, onOpenFull, onToggleCanvas, onOpenNotifications }) {
  const { showToast } = useApp()
  const { startCall } = useVoiceCall()
  const [val, setVal] = React.useState('')
  const scrollRef = useRef(null)
  const messages = thread?.messages || []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, thread?.id])

  const send = () => {
    const text = val.trim()
    if (!text) return
    setVal('')
    onSend(text)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Thread header */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-bdr-light flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-txt-primary truncate">
            {thread?.title || 'Setu Assistant'}
          </div>
          <div className="text-[11px] text-txt-secondary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ok inline-block" /> Online · Multilingual
          </div>
        </div>
        <button
          onClick={startCall}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white text-[12px] font-bold transition-colors"
          aria-label="Talk to Setu"
          title="Talk to Setu"
        >
          <Phone size={13} /> <span className="hidden sm:inline">Talk to Setu</span>
        </button>
        {onToggleCanvas && (
          <button
            onClick={onToggleCanvas}
            className="hidden lg:flex w-9 h-9 rounded-full hover:bg-surface-secondary text-txt-secondary items-center justify-center"
            aria-label="Toggle canvas"
          >
            <PanelRight size={18} />
          </button>
        )}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="hidden lg:flex w-9 h-9 rounded-full hover:bg-surface-secondary text-txt-secondary items-center justify-center relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-danger" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
        <div className="max-w-[760px] mx-auto space-y-4">
          {messages.map((m, i) => (
            <Message key={i} m={m} onOpenApp={onOpenApp} onOpenFull={onOpenFull} />
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-bdr-light bg-white px-3 py-3 flex-shrink-0">
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
                  send()
                }
              }}
              rows={1}
              placeholder="Message Setu…"
              className="flex-1 py-2.5 text-[14px] leading-snug outline-none bg-transparent resize-none max-h-32 min-w-0 w-full block"
            />
          </div>
          <button
            onClick={send}
            disabled={!val.trim()}
            className="w-10 h-10 rounded-full bg-primary text-white shadow-card flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-transform"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center text-[10px] text-txt-tertiary mt-1.5">
          Setu can make mistakes. Verify critical migration info with a verified agent.
        </div>
      </div>
    </div>
  )
}

function Message({ m, onOpenApp, onOpenFull }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end animate-bubble-in">
        <div className="max-w-[80%] bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-sm">
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-2 animate-bubble-in">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <Logo size={18} />
      </div>
      <div className="flex-1 min-w-0 max-w-[88%]">
        <div className="bg-surface-secondary text-txt-primary px-4 py-2.5 rounded-2xl rounded-bl-sm">
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
        </div>
        {/* Canvas invocations — primary card for the top match, chips for others. */}
        {m.canvasInvocations && m.canvasInvocations.length > 0 && (
          <div className="mt-2 space-y-2">
            {m.canvasInvocations.slice(0, 1).map(inv => {
              const app = getAppById(inv.appId)
              if (!app) return null
              const Icon = app.icon
              return (
                <button
                  key={inv.appId}
                  onClick={() => onOpenApp(app)}
                  className="w-full flex items-center gap-3 p-3 bg-white border-2 border-primary-light hover:border-primary rounded-xl text-left transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-card">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-primary uppercase tracking-wide">Open in canvas</div>
                    <div className="text-[13px] font-bold text-txt-primary truncate">{app.title}</div>
                    <div className="text-[11px] text-txt-secondary truncate">{app.summary}</div>
                  </div>
                  <ChevronRight size={16} className="text-primary group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </button>
              )
            })}
            {m.canvasInvocations.length > 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-txt-tertiary mr-1 self-center">Or:</span>
                {m.canvasInvocations.slice(1).map(inv => {
                  const app = getAppById(inv.appId)
                  if (!app) return null
                  const Icon = app.icon
                  return (
                    <button
                      key={inv.appId}
                      onClick={() => onOpenApp(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-bdr text-txt-primary rounded-full text-[11.5px] font-semibold hover:border-primary hover:text-primary transition-colors"
                    >
                      <Icon size={12} /> {app.title}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
