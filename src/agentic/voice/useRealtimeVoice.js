import { useCallback, useEffect, useRef, useState } from 'react'

// Browser-side WebRTC client for OpenAI's Realtime API.
//
// State machine:
//   idle         → user has not started a call yet
//   connecting   → fetching ephemeral key + negotiating SDP
//   listening    → mic streaming, waiting for the user to speak
//   speaking     → assistant is producing audio response
//   muted        → mic muted (call still active in either listening / speaking)
//   ended        → call cleanly ended by the user
//   error        → unrecoverable (mic denied, no token, ICE failure, etc)
//
// Errors are surfaced through `error` (string code) + `errorMessage` (human).
// Specific codes the UI maps to friendly copy:
//   mic_permission_denied
//   mic_unavailable
//   missing_server_key
//   token_fetch_failed
//   webrtc_connect_failed
//   network_lost

const TOKEN_ENDPOINT = '/api/realtime-session'

export function useRealtimeVoice() {
  const [status, setStatus]               = useState('idle')
  const [muted,  setMuted]                = useState(false)
  const [error,  setError]                = useState(null)        // code
  const [errorMessage, setErrorMessage]   = useState(null)        // human copy
  const [transcript, setTranscript]       = useState([])          // [{role,text,partial}]
  const [voiceLevel, setVoiceLevel]       = useState(0)           // 0–1, for UI ring

  // Refs hold WebRTC primitives so re-renders don't tear them down.
  const pcRef          = useRef(null)
  const localStreamRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const dataChannelRef = useRef(null)
  const levelRafRef    = useRef(null)
  const analyserRef    = useRef(null)
  const audioCtxRef    = useRef(null)

  // Public effective status: collapse muted on top of underlying state so the
  // UI can show "Listening (muted)" without losing the listening/speaking mode.
  const effectiveStatus = muted && (status === 'listening' || status === 'speaking') ? 'muted' : status

  const setErr = useCallback((code, msg) => {
    setError(code)
    setErrorMessage(msg)
    setStatus('error')
  }, [])

  // ── Cleanup ────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (levelRafRef.current) cancelAnimationFrame(levelRafRef.current)
    levelRafRef.current = null
    try { dataChannelRef.current?.close() } catch {}
    dataChannelRef.current = null
    try { pcRef.current?.getSenders().forEach(s => s.track?.stop()) } catch {}
    try { pcRef.current?.close() } catch {}
    pcRef.current = null
    try { localStreamRef.current?.getTracks().forEach(t => t.stop()) } catch {}
    localStreamRef.current = null
    try { audioCtxRef.current?.close() } catch {}
    audioCtxRef.current = null
    analyserRef.current = null
    if (remoteAudioRef.current) {
      try { remoteAudioRef.current.pause(); remoteAudioRef.current.srcObject = null } catch {}
    }
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  // ── Start a call ───────────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (status === 'connecting' || status === 'listening' || status === 'speaking' || status === 'muted') return
    setError(null)
    setErrorMessage(null)
    setTranscript([])
    setStatus('connecting')

    // 1. Request microphone access first — fails fastest if user denies.
    let micStream
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      const denied = e?.name === 'NotAllowedError' || e?.name === 'SecurityError'
      const missing = e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError'
      cleanup()
      if (denied) {
        return setErr('mic_permission_denied',
          'Microphone access was blocked. Allow mic access in your browser and try again.')
      }
      if (missing) {
        return setErr('mic_unavailable',
          'No working microphone was detected. Plug one in or pick a different input device.')
      }
      return setErr('mic_unavailable',
        'Could not start the microphone. Try reloading the page or using a different browser.')
    }
    localStreamRef.current = micStream

    // 2. Mint an ephemeral key from our serverless function.
    let ephemeral
    try {
      const r = await fetch(TOKEN_ENDPOINT, { method: 'POST' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        cleanup()
        if (data.error === 'missing_server_key') {
          return setErr('missing_server_key',
            'The voice assistant is not configured on the server. The site owner needs to set OPENAI_API_KEY.')
        }
        return setErr('token_fetch_failed',
          data.message || 'Could not start the voice session. Please try again in a moment.')
      }
      ephemeral = data
      if (!ephemeral?.client_secret?.value) {
        cleanup()
        return setErr('token_fetch_failed', 'Backend returned an invalid session token.')
      }
    } catch (e) {
      cleanup()
      return setErr('token_fetch_failed',
        'Could not reach the voice-session backend. Check your connection and retry.')
    }

    // 3. Build the peer connection.
    const pc = new RTCPeerConnection()
    pcRef.current = pc

    // Remote audio (assistant voice)
    let audioEl = remoteAudioRef.current
    if (!audioEl) {
      audioEl = document.createElement('audio')
      audioEl.autoplay = true
      audioEl.playsInline = true
      remoteAudioRef.current = audioEl
    }
    pc.ontrack = (ev) => { audioEl.srcObject = ev.streams[0] }

    // Local mic
    micStream.getTracks().forEach(track => pc.addTrack(track, micStream))

    // Data channel for events (transcripts, speech start/stop, etc).
    const dc = pc.createDataChannel('oai-events')
    dataChannelRef.current = dc
    dc.addEventListener('message', (ev) => {
      try { handleServerEvent(JSON.parse(ev.data)) } catch {}
    })

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState
      if (st === 'failed' || st === 'disconnected') {
        cleanup()
        setErr('network_lost',
          'The voice connection dropped. Tap the call button to try again.')
      }
    }

    // 4. SDP exchange via OpenAI realtime endpoint, authenticated with the
    //    ephemeral key (NOT the server key).
    let answer
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpResp = await fetch(
        `https://api.openai.com/v1/realtime?model=${encodeURIComponent(ephemeral.model)}`,
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            'Authorization': `Bearer ${ephemeral.client_secret.value}`,
            'Content-Type': 'application/sdp',
          },
        },
      )
      if (!sdpResp.ok) {
        cleanup()
        return setErr('webrtc_connect_failed',
          'OpenAI rejected the connection. The session may have expired — please retry.')
      }
      const answerSdp = await sdpResp.text()
      answer = { type: 'answer', sdp: answerSdp }
      await pc.setRemoteDescription(answer)
    } catch (e) {
      cleanup()
      return setErr('webrtc_connect_failed',
        'Could not establish a real-time connection. Check your network and retry.')
    }

    // 5. Voice-level meter (drives the pulse ring in the UI).
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)()
      const src = ac.createMediaStreamSource(micStream)
      const analyser = ac.createAnalyser()
      analyser.fftSize = 512
      src.connect(analyser)
      audioCtxRef.current = ac
      analyserRef.current = analyser
      const buf = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteTimeDomainData(buf)
        let peak = 0
        for (let i = 0; i < buf.length; i++) {
          const v = Math.abs(buf[i] - 128) / 128
          if (v > peak) peak = v
        }
        setVoiceLevel(peak)
        levelRafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch { /* meter is non-critical */ }

    setStatus('listening')
  }, [status, cleanup, setErr])

  // ── Server event handler ───────────────────────────────────────────────
  // Realtime API streams events down the data channel. We only care about a
  // small slice: speech start/stop (drive listening ↔ speaking), and partial
  // transcripts so the UI can show captions.
  const handleServerEvent = useCallback((evt) => {
    switch (evt.type) {
      case 'response.created':
      case 'response.output_audio.delta':
        setStatus(s => (s === 'error' || s === 'ended') ? s : 'speaking')
        break
      case 'response.done':
      case 'response.output_audio.done':
        setStatus(s => (s === 'error' || s === 'ended') ? s : 'listening')
        break
      case 'input_audio_buffer.speech_started':
        // user started talking — keep state on listening
        break
      case 'conversation.item.input_audio_transcription.completed':
        if (evt.transcript) {
          setTranscript(prev => [...prev, { role: 'user', text: evt.transcript }])
        }
        break
      case 'response.output_audio_transcript.delta':
        setTranscript(prev => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.partial) {
            return [...prev.slice(0, -1), { ...last, text: last.text + (evt.delta || '') }]
          }
          return [...prev, { role: 'assistant', text: evt.delta || '', partial: true }]
        })
        break
      case 'response.output_audio_transcript.done':
        setTranscript(prev => prev.map(m => m.partial ? { ...m, partial: false } : m))
        break
      default:
        // ignore unrelated events
        break
    }
  }, [])

  // ── Mute / unmute ──────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const s = localStreamRef.current
    if (!s) return
    const next = !muted
    s.getAudioTracks().forEach(t => { t.enabled = !next })
    setMuted(next)
  }, [muted])

  // ── End call ───────────────────────────────────────────────────────────
  const end = useCallback(() => {
    cleanup()
    setMuted(false)
    setVoiceLevel(0)
    setStatus('ended')
  }, [cleanup])

  // Send an arbitrary event into the OpenAI Realtime data channel. Used by
  // the screen-share pipeline to push visual-context notes into the live
  // session without having to reconnect. Returns true on success.
  const sendEvent = useCallback((payload) => {
    const dc = dataChannelRef.current
    if (!dc || dc.readyState !== 'open') return false
    try { dc.send(JSON.stringify(payload)); return true } catch { return false }
  }, [])

  return {
    status: effectiveStatus,
    muted,
    error,
    errorMessage,
    transcript,
    voiceLevel,
    start,
    end,
    toggleMute,
    sendEvent,
    reset: () => { setStatus('idle'); setError(null); setErrorMessage(null); setTranscript([]) },
  }
}
