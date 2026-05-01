import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRealtimeVoice } from './useRealtimeVoice'
import { useScreenShare } from './useScreenShare'

const ANALYZE_ENDPOINT = '/api/analyze-screen'

// Build a "system" conversation item for the Realtime API. We use system
// role for screen-share state notes so Setu treats them as out-of-band
// awareness rather than as something the user said.
function systemNote(text) {
  return {
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'system',
      content: [{ type: 'input_text', text }],
    },
  }
}

// The four event helpers Setu's persona is trained to recognise.
const visualContextEvent  = (summary) => systemNote(`[VISUAL CONTEXT] ${summary}`)
const shareStartedEvent   = () => systemNote(
  '[SCREEN SHARE STARTED] The user has just begun sharing their screen. ' +
  'Visual context notes will arrive every few seconds. Briefly confirm to ' +
  'the user out loud: "I can see your screen now — what would you like help with?"'
)
const shareStoppedEvent   = () => systemNote(
  '[SCREEN SHARE STOPPED] The user has stopped sharing their screen. ' +
  'Do not mention this unless the user asks about screen sharing.'
)
// Asking the model to actually generate a response after a system event.
const generateResponse    = () => ({ type: 'response.create' })

// Hosts the realtime voice call at the React root so the call survives across
// page navigation, modal close/open, etc. The modal becomes a minimizable
// "view" of this state — closing it does NOT end the call. A floating pill
// in the top-right shows the call status + duration + disconnect while the
// user roams the app.

const VoiceCallContext = createContext(null)

export function VoiceCallProvider({ children }) {
  const voice = useRealtimeVoice()
  const [expanded, setExpanded] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const tickRef = useRef(null)
  const lastSummaryRef = useRef('')   // dedupe consecutive identical summaries
  const [screenSummary, setScreenSummary] = useState(null) // shown in the modal

  // ── Screen sharing ─────────────────────────────────────────────────────
  // Each captured frame is sent to the backend vision endpoint. The returned
  // summary is injected into the realtime data channel so Setu can guide the
  // user step-by-step based on what's actually on their screen.
  const handleFrame = useCallback(async ({ base64 }) => {
    try {
      const r = await fetch(ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64, mime: 'image/jpeg' }),
      })
      if (!r.ok) return
      const data = await r.json().catch(() => ({}))
      const summary = (data?.summary || '').trim()
      if (!summary) return
      // Skip if the summary hasn't meaningfully changed since last frame.
      if (summary === lastSummaryRef.current) return
      lastSummaryRef.current = summary
      setScreenSummary(summary)
      voice.sendEvent(visualContextEvent(summary))
    } catch { /* analyse failures are non-critical */ }
  }, [voice])

  const screen = useScreenShare({ onFrame: handleFrame })

  // Stop screen sharing when the call ends — orphaned screen capture would be
  // a privacy hazard.
  useEffect(() => {
    if (voice.status === 'ended' || voice.status === 'error' || voice.status === 'idle') {
      if (screen.status === 'sharing' || screen.status === 'asking') screen.stop()
      setScreenSummary(null)
      lastSummaryRef.current = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.status])

  // Announce share-start / share-stop to the realtime session so the model
  // has explicit state — not just inferring from the absence/presence of
  // [VISUAL CONTEXT] notes. On start we also kick a response so Setu speaks
  // a quick "I can see your screen now" confirmation.
  const prevScreenStatus = useRef(screen.status)
  useEffect(() => {
    const prev = prevScreenStatus.current
    const cur  = screen.status
    prevScreenStatus.current = cur

    if (prev !== 'sharing' && cur === 'sharing') {
      // Wait for the data channel to be open + give the user a beat. The
      // sendEvent calls no-op safely if the channel isn't ready yet.
      const t = setTimeout(() => {
        voice.sendEvent(shareStartedEvent())
        voice.sendEvent(generateResponse())
      }, 250)
      return () => clearTimeout(t)
    }
    if (prev === 'sharing' && cur !== 'sharing') {
      voice.sendEvent(shareStoppedEvent())
      lastSummaryRef.current = ''
      setScreenSummary(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.status])

  // Mark "call established" the first time we hit listening / speaking so the
  // timer reflects connect time, not the moment the user clicked "Call".
  const isLive = voice.status === 'listening' || voice.status === 'speaking' || voice.status === 'muted'

  useEffect(() => {
    if (isLive && !startedAt) {
      setStartedAt(Date.now())
    }
    if (!isLive && voice.status !== 'connecting') {
      // call dropped, ended, or errored — stop the clock
      setStartedAt(null)
      setSeconds(0)
    }
  }, [isLive, voice.status, startedAt])

  useEffect(() => {
    if (!startedAt) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
      return
    }
    tickRef.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [startedAt])

  // Auto-collapse the modal once the call ends or errors so the underlying
  // app is interactive again.
  useEffect(() => {
    if (voice.status === 'ended' || voice.status === 'error') {
      // keep expanded for the error/ended view so the user sees retry, but
      // mark it dismissable.
    }
  }, [voice.status])

  const startCall = () => {
    setExpanded(true)
    if (voice.status === 'idle' || voice.status === 'ended' || voice.status === 'error') {
      voice.start()
    }
  }
  const endCall   = () => { voice.end(); setStartedAt(null); setSeconds(0) }
  const expand    = () => setExpanded(true)
  const minimize  = () => setExpanded(false)
  const dismiss   = () => { voice.reset(); setExpanded(false); setStartedAt(null); setSeconds(0) }

  const value = {
    ...voice,
    expanded, startedAt, seconds, isLive,
    startCall, endCall, expand, minimize, dismiss,
    // Screen sharing
    screenStatus:        screen.status,
    screenError:         screen.error,
    screenPreviewDataUrl: screen.previewDataUrl,
    screenSummary,
    startScreenShare:    screen.start,
    stopScreenShare:     screen.stop,
  }

  return <VoiceCallContext.Provider value={value}>{children}</VoiceCallContext.Provider>
}

export function useVoiceCall() {
  const ctx = useContext(VoiceCallContext)
  if (!ctx) throw new Error('useVoiceCall must be used inside <VoiceCallProvider>')
  return ctx
}

export function formatCallDuration(s) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`
}
