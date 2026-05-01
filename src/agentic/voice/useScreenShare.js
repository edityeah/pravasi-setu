import { useCallback, useEffect, useRef, useState } from 'react'

// Browser-side screen-sharing pipeline used by the voice assistant.
//
// Flow:
//   1. User clicks "Share screen" → we call getDisplayMedia which surfaces
//      the browser's native picker (tab / window / entire screen).
//   2. The MediaStream lands in a hidden <video> element.
//   3. Every FRAME_INTERVAL_MS we draw the current video frame into a hidden
//      <canvas>, encode it as a downscaled JPEG, and hand the dataURL to the
//      consumer via `onFrame`.
//   4. The consumer (VoiceCallProvider) posts the frame to /api/analyze-screen
//      which returns a one-sentence summary, and injects that summary into
//      the running realtime session as a visual-context note. Setu can then
//      reference what the user is currently seeing.
//
// State machine:
//   idle            → user has not shared yet
//   asking          → getDisplayMedia picker is open
//   sharing         → stream is live, frames are being captured
//   stopped         → user (or page) stopped the stream cleanly
//   denied          → user dismissed the picker / blocked permission
//   error           → unexpected capture failure
//
// We never persist captured frames anywhere — they live in memory only and
// are discarded once posted to the analyse endpoint.

const FRAME_INTERVAL_MS = 3000   // 1 frame every 3 seconds (matches the spec)
const FRAME_MAX_DIM     = 1024   // longest edge — keeps payload + token cost low
const JPEG_QUALITY      = 0.7

export function useScreenShare({ onFrame } = {}) {
  const [status, setStatus] = useState('idle')
  const [error,  setError]  = useState(null)
  const [previewDataUrl, setPreviewDataUrl] = useState(null) // shown as thumbnail in the modal

  const streamRef    = useRef(null)
  const videoRef     = useRef(null)
  const canvasRef    = useRef(null)
  const intervalRef  = useRef(null)
  const onFrameRef   = useRef(onFrame)
  useEffect(() => { onFrameRef.current = onFrame }, [onFrame])

  // ── Stop everything ────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => { try { t.stop() } catch {} })
      streamRef.current = null
    }
    if (videoRef.current) {
      try { videoRef.current.pause() } catch {}
      try { videoRef.current.srcObject = null } catch {}
    }
    setStatus(prev => (prev === 'sharing' || prev === 'asking') ? 'stopped' : prev)
    setPreviewDataUrl(null)
  }, [])

  // Cleanup on unmount.
  useEffect(() => () => stop(), [stop])

  // ── Frame capture tick ─────────────────────────────────────────────────
  const captureFrame = useCallback(() => {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c || !v.videoWidth || !v.videoHeight) return null

    const longest = Math.max(v.videoWidth, v.videoHeight)
    const scale = longest > FRAME_MAX_DIM ? FRAME_MAX_DIM / longest : 1
    c.width  = Math.round(v.videoWidth  * scale)
    c.height = Math.round(v.videoHeight * scale)
    const ctx = c.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(v, 0, 0, c.width, c.height)
    const dataUrl = c.toDataURL('image/jpeg', JPEG_QUALITY)
    return dataUrl
  }, [])

  // ── Start sharing ──────────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (status === 'asking' || status === 'sharing') return
    setError(null)
    setStatus('asking')

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('unsupported')
      setStatus('error')
      return null
    }

    let stream
    try {
      // Audio explicitly off — we only need pixels, and the voice agent
      // already owns the user's microphone.
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 4 },
        audio: false,
      })
    } catch (e) {
      const denied = e?.name === 'NotAllowedError' || e?.name === 'AbortError'
      setError(denied ? 'permission_denied' : 'capture_failed')
      setStatus(denied ? 'denied' : 'error')
      return null
    }

    streamRef.current = stream

    // Hidden video element fed by the screen stream. Kept off-DOM but reused
    // across share sessions so we don't churn elements.
    if (!videoRef.current) {
      const v = document.createElement('video')
      v.autoplay = true
      v.playsInline = true
      v.muted = true
      videoRef.current = v
    }
    videoRef.current.srcObject = stream
    try { await videoRef.current.play() } catch { /* play() rejection is benign here */ }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }

    // The browser shows its own "Stop sharing" toolbar — reflect that here
    // by listening for the track ending so the UI stays in sync.
    const [track] = stream.getVideoTracks()
    if (track) track.addEventListener('ended', stop)

    setStatus('sharing')

    // Kick off the capture loop. First frame fires after a short delay so the
    // <video> has time to populate videoWidth / videoHeight.
    const tick = async () => {
      const dataUrl = captureFrame()
      if (!dataUrl) return
      setPreviewDataUrl(dataUrl)
      const base64 = dataUrl.split(',')[1]
      try {
        await onFrameRef.current?.({ base64, mime: 'image/jpeg', dataUrl })
      } catch { /* consumer errors are non-fatal here */ }
    }
    setTimeout(tick, 600)
    intervalRef.current = setInterval(tick, FRAME_INTERVAL_MS)

    return stream
  }, [status, captureFrame, stop])

  return { status, error, previewDataUrl, start, stop }
}
