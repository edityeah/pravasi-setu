import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useRealtimeVoice } from './useRealtimeVoice'

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
