import React from 'react'
import { Mic, MicOff, PhoneOff, Phone, Loader2, AlertCircle, Maximize2 } from 'lucide-react'
import { useVoiceCall, formatCallDuration } from './VoiceCallProvider'

// Persistent floating pill shown whenever a call is connecting / live /
// errored. Sits to the LEFT of the notification bell so it never collides.
// Click the pill (anywhere except mute/end) to re-open the modal; click
// minimize on the modal to come back here without ending the call.

export default function CallStatusPill() {
  const { status, seconds, expand, endCall, toggleMute, muted, errorMessage } = useVoiceCall()

  // Only render when there's something to show. `idle` and `ended` are silent.
  if (status === 'idle' || status === 'ended') return null

  const meta = STATUS[status] || STATUS.connecting

  return (
    <div className="fixed top-3 right-20 z-[90] animate-fade-in">
      <div
        className={`flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border shadow-modal ${meta.shell}`}
        role="status"
        aria-live="polite"
      >
        {/* Status indicator */}
        <button
          onClick={expand}
          className="flex items-center gap-2 min-w-0"
          title="Open call window"
        >
          <span className={`relative flex w-2.5 h-2.5 ${meta.dotPing ? '' : ''}`}>
            {meta.dotPing && <span className="absolute inset-0 rounded-full bg-current opacity-60 animate-ping" />}
            <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ${meta.dot}`} />
          </span>
          <span className={`text-[12px] font-bold ${meta.text} whitespace-nowrap`}>
            {meta.label}
          </span>
          {seconds > 0 && status !== 'error' && (
            <span className={`text-[11px] font-mono tabular-nums ${meta.timer}`}>
              {formatCallDuration(seconds)}
            </span>
          )}
        </button>

        {/* Quick mute (only when call is actually live) */}
        {(status === 'listening' || status === 'speaking' || status === 'muted') && (
          <button
            onClick={toggleMute}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              muted ? 'bg-warn-light text-warn-text' : 'bg-white/60 hover:bg-white text-txt-primary'
            }`}
            aria-label={muted ? 'Unmute' : 'Mute'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff size={13} /> : <Mic size={13} />}
          </button>
        )}

        {/* Expand */}
        <button
          onClick={expand}
          className="w-7 h-7 rounded-full bg-white/60 hover:bg-white text-txt-primary flex items-center justify-center"
          aria-label="Open call window"
          title="Open call window"
        >
          <Maximize2 size={13} />
        </button>

        {/* Disconnect */}
        <button
          onClick={endCall}
          className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
          aria-label="End call"
          title="End call"
        >
          <PhoneOff size={13} />
        </button>
      </div>

      {/* If we're in an error state, show the message just below the pill —
          dismissed when the user clicks expand (modal has retry CTA). */}
      {status === 'error' && errorMessage && (
        <div className="mt-1 max-w-[300px] bg-white border border-red-200 rounded-xl shadow-card p-2.5 text-[11px] text-red-700 leading-snug">
          {errorMessage}
        </div>
      )}
    </div>
  )
}

const STATUS = {
  connecting: {
    label: 'Connecting…',
    shell: 'bg-primary-light border-primary/30',
    dot:   'bg-primary',
    dotPing: true,
    text:  'text-primary',
    timer: 'text-primary',
  },
  listening: {
    label: 'On call · Listening',
    shell: 'bg-emerald-50 border-emerald-200',
    dot:   'bg-emerald-500',
    dotPing: true,
    text:  'text-emerald-700',
    timer: 'text-emerald-700',
  },
  speaking: {
    label: 'On call · Setu speaking',
    shell: 'bg-blue-50 border-blue-200',
    dot:   'bg-blue-500',
    dotPing: true,
    text:  'text-blue-700',
    timer: 'text-blue-700',
  },
  muted: {
    label: 'On call · Muted',
    shell: 'bg-warn-light border-warn/30',
    dot:   'bg-warn',
    dotPing: false,
    text:  'text-warn-text',
    timer: 'text-warn-text',
  },
  error: {
    label: 'Call error',
    shell: 'bg-red-50 border-red-200',
    dot:   'bg-red-500',
    dotPing: false,
    text:  'text-red-700',
    timer: 'text-red-700',
  },
}
