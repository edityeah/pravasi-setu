import React from 'react'
import {
  Mic, MicOff, PhoneOff, X, AlertCircle, Loader2, Phone, Minimize2,
  Monitor, MonitorOff, ShieldAlert, Eye,
} from 'lucide-react'
import { useVoiceCall, formatCallDuration } from './VoiceCallProvider'
import Logo from '../../components/Logo'

// Modal "view" of the global voice call. Closing it (X or minimize) keeps the
// call running — a floating pill in the top-right takes over so the user can
// keep navigating the app while still on the call.

const STATUS_META = {
  idle:       { label: 'Ready to talk',    sub: 'Tap the call button to begin.', tone: 'idle' },
  connecting: { label: 'Connecting…',      sub: 'Waking up the assistant — this usually takes a couple of seconds.', tone: 'connecting' },
  listening:  { label: 'Listening',        sub: 'Speak naturally — I\'ll respond when you pause. You can close this window and keep using the app.', tone: 'listening' },
  speaking:   { label: 'Setu is speaking', sub: 'Hold on — let me finish, then go ahead. You can keep navigating while I talk.', tone: 'speaking' },
  muted:      { label: 'Muted',            sub: 'Tap mute again to keep talking.', tone: 'muted' },
  ended:      { label: 'Call ended',       sub: 'Hope that helped. Start another call any time.', tone: 'ended' },
  error:      { label: 'Couldn\'t connect',sub: 'See the message below — fix it and try again.', tone: 'error' },
}

const TONE_RING = {
  idle:       'bg-surface-secondary text-txt-secondary',
  connecting: 'bg-primary-light text-primary animate-pulse',
  listening:  'bg-emerald-100 text-emerald-600',
  speaking:   'bg-blue-100 text-blue-600',
  muted:      'bg-surface-secondary text-txt-secondary',
  ended:      'bg-surface-secondary text-txt-secondary',
  error:      'bg-red-100 text-red-600',
}

export default function VoiceAgentModal() {
  const v = useVoiceCall()
  if (!v.expanded) return null
  const meta = STATUS_META[v.status] || STATUS_META.idle
  const callLive = v.status === 'listening' || v.status === 'speaking' || v.status === 'muted'

  const handleClose = () => {
    // If a call is in progress, just minimize so the floating pill takes
    // over. Otherwise dismiss the whole modal.
    if (callLive || v.status === 'connecting') {
      v.minimize()
    } else {
      v.dismiss()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-modal overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <Logo size={36} />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider">Voice Assistant</div>
            <div className="text-[15px] font-extrabold text-txt-primary flex items-center gap-2">
              Setu — Pravasi Setu
              {v.seconds > 0 && (
                <span className="text-[11px] font-mono tabular-nums text-txt-tertiary font-semibold">
                  {formatCallDuration(v.seconds)}
                </span>
              )}
            </div>
          </div>
          {callLive && (
            <button
              onClick={v.minimize}
              className="w-9 h-9 rounded-full hover:bg-surface-secondary text-txt-secondary flex items-center justify-center"
              aria-label="Minimize — keep call running"
              title="Minimize — keep call running"
            >
              <Minimize2 size={16} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full hover:bg-surface-secondary text-txt-secondary flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visualizer */}
        <div className="px-5 pb-5 flex flex-col items-center text-center">
          <PulseRing tone={meta.tone} level={v.voiceLevel} muted={v.muted} status={v.status} />

          <div className="mt-5 text-[16px] font-extrabold text-txt-primary">{meta.label}</div>
          <p className="text-[12px] text-txt-secondary mt-1 max-w-[320px] leading-relaxed">
            {v.errorMessage || meta.sub}
          </p>

          {v.error && <ErrorHelper code={v.error} />}

          {callLive && (
            <button
              onClick={v.minimize}
              className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline"
            >
              <Minimize2 size={12} /> Keep talking while I navigate the app
            </button>
          )}

          {/* ── Screen sharing ─────────────────────────────────────────
              Lets the user share their tab/window so Setu can see what they
              see. Frames are sampled every ~3s, summarised by GPT-4o vision
              behind /api/analyze-screen, and the summary is injected back
              into the realtime session as silent visual context. */}
          {callLive && <ScreenShareBlock v={v} />}

          {/* Live captions — last 3 turns. */}
          {v.transcript.length > 0 && (
            <div className="mt-4 w-full bg-surface-secondary rounded-xl p-3 max-h-32 overflow-y-auto text-left space-y-1">
              {v.transcript.slice(-3).map((m, i) => (
                <div key={i} className="text-[11.5px] leading-snug">
                  <span className={`font-bold ${m.role === 'user' ? 'text-primary' : 'text-emerald-600'}`}>
                    {m.role === 'user' ? 'You' : 'Setu'}:
                  </span>{' '}
                  <span className="text-txt-primary">{m.text}</span>
                  {m.partial && <span className="text-txt-tertiary"> …</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-bdr-light px-5 py-4 flex items-center justify-center gap-3">
          {v.status === 'error' || v.status === 'ended' ? (
            <>
              <button
                onClick={v.startCall}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-pill bg-primary hover:bg-primary-dark text-white font-bold text-[13px] py-3 shadow-card"
              >
                <Phone size={16} /> {v.status === 'error' ? 'Try again' : 'Start new call'}
              </button>
              <button
                onClick={v.dismiss}
                className="px-4 rounded-pill border border-bdr-light text-txt-secondary font-bold text-[13px] py-3 hover:bg-surface-secondary"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                onClick={v.toggleMute}
                disabled={v.status === 'connecting'}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 ${
                  v.muted
                    ? 'bg-warn-light text-warn'
                    : 'bg-surface-secondary text-txt-primary hover:bg-bdr-light'
                }`}
                aria-label={v.muted ? 'Unmute' : 'Mute'}
                title={v.muted ? 'Unmute' : 'Mute'}
              >
                {v.muted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={v.endCall}
                disabled={v.status === 'connecting'}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-pill bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] py-3 shadow-card disabled:opacity-40"
              >
                <PhoneOff size={16} /> End call
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PulseRing({ tone, level, muted, status }) {
  const scale = (status === 'listening' && !muted) ? (1 + Math.min(level, 0.6) * 0.35) : 1
  const showSpinner = status === 'connecting'
  return (
    <div className="relative flex items-center justify-center mt-3">
      <div
        className={`absolute inset-0 rounded-full ${TONE_RING[tone] || ''} transition-transform`}
        style={{ width: 112, height: 112, transform: `scale(${scale})`, transformOrigin: 'center' }}
      />
      <div className="relative w-28 h-28 rounded-full bg-white border border-bdr-light flex items-center justify-center shadow-card">
        {showSpinner ? (
          <Loader2 size={36} className="text-primary animate-spin" />
        ) : muted ? (
          <MicOff size={32} className="text-txt-secondary" />
        ) : status === 'speaking' ? (
          <SpeakingBars />
        ) : status === 'error' ? (
          <AlertCircle size={32} className="text-red-600" />
        ) : (
          <Mic size={32} className={status === 'listening' ? 'text-emerald-600' : 'text-txt-secondary'} />
        )}
      </div>
    </div>
  )
}

function SpeakingBars() {
  return (
    <div className="flex items-end gap-1 h-8">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-blue-600"
          style={{
            animation: `setuBar 0.9s ease-in-out infinite`,
            animationDelay: `${i * 80}ms`,
            height: '100%',
          }}
        />
      ))}
      <style>{`@keyframes setuBar { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }`}</style>
    </div>
  )
}

// ─── Screen-share UI block ──────────────────────────────────────────────
// Slot rendered inside the modal whenever the call is live. Shows the
// share/stop button, the latest captured thumbnail, the privacy notice,
// and the latest one-line summary the model returned.
function ScreenShareBlock({ v }) {
  const sharing  = v.screenStatus === 'sharing'
  const asking   = v.screenStatus === 'asking'
  const denied   = v.screenStatus === 'denied'
  const stopped  = v.screenStatus === 'stopped'
  const errored  = v.screenStatus === 'error'

  return (
    <div className="mt-5 w-full bg-surface-secondary rounded-xl p-3 text-left">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Eye size={13} className="text-primary" />
          <span className="text-[11.5px] font-bold text-txt-primary">Share screen with Setu</span>
        </div>
        {sharing && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
          </span>
        )}
      </div>

      {/* Privacy notice — always visible */}
      <div className="flex items-start gap-2 p-2 rounded-lg bg-warn-light/60 border border-warn/30 mb-2">
        <ShieldAlert size={13} className="text-warn-text flex-shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-warn-text leading-snug">
          Only share the Pravasi Setu tab/window. Do not share your full screen if sensitive information is visible.
        </p>
      </div>

      {/* Action button */}
      {!sharing && (
        <button
          onClick={v.startScreenShare}
          disabled={asking}
          className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white text-[12.5px] font-bold py-2.5 transition-colors disabled:opacity-50"
        >
          {asking ? <><Loader2 size={14} className="animate-spin" /> Asking permission…</>
                  : <><Monitor size={14} /> Share screen</>}
        </button>
      )}
      {sharing && (
        <button
          onClick={v.stopScreenShare}
          className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-bold py-2.5"
        >
          <MonitorOff size={14} /> Stop sharing
        </button>
      )}

      {/* Status hints */}
      {denied && (
        <p className="text-[10.5px] text-red-700 mt-2 leading-snug">
          Screen-share permission was dismissed. Click <span className="font-bold">Share screen</span> again and pick a tab or window.
        </p>
      )}
      {errored && (
        <p className="text-[10.5px] text-red-700 mt-2 leading-snug">
          Couldn't start screen capture. Your browser may not support it — try the latest Chrome / Edge.
        </p>
      )}
      {stopped && !sharing && (
        <p className="text-[10.5px] text-txt-secondary mt-2 leading-snug">
          Sharing stopped. Setu won't see your screen until you start again.
        </p>
      )}

      {/* Thumbnail preview + summary */}
      {sharing && (
        <div className="mt-2 grid grid-cols-[96px,1fr] gap-2 items-stretch">
          <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black/80 border border-bdr">
            {v.screenPreviewDataUrl ? (
              <img
                src={v.screenPreviewDataUrl}
                alt="Screen preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60 text-[9px]">
                Loading…
              </div>
            )}
          </div>
          <div className="text-[10.5px] text-txt-secondary leading-snug bg-white rounded-lg border border-bdr-light p-2">
            <div className="font-bold text-txt-primary uppercase tracking-wide text-[9px] mb-0.5">Setu sees</div>
            {v.screenSummary || 'Looking at your screen…'}
          </div>
        </div>
      )}
    </div>
  )
}

function ErrorHelper({ code }) {
  if (code === 'mic_permission_denied') {
    return (
      <p className="mt-3 text-[11px] text-txt-secondary max-w-[320px] leading-relaxed">
        Click the lock icon in your browser's address bar → <span className="font-semibold text-txt-primary">Site settings</span> → set Microphone to Allow → reload the page.
      </p>
    )
  }
  if (code === 'missing_server_key') {
    return (
      <p className="mt-3 text-[11px] text-txt-secondary max-w-[320px] leading-relaxed">
        Set <code className="text-[10px] bg-surface-secondary px-1 rounded">OPENAI_API_KEY</code> in your Vercel project settings (or in <code className="text-[10px] bg-surface-secondary px-1 rounded">.env.local</code> for local dev) and redeploy.
      </p>
    )
  }
  return null
}
