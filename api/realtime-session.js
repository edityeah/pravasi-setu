// Vercel Serverless Function — POST /api/realtime-session
//
// Mints an ephemeral client secret for OpenAI's Realtime API so the browser
// can establish a WebRTC session WITHOUT ever seeing OPENAI_API_KEY.
//
// Setup:
//   - Set OPENAI_API_KEY in Vercel project settings (Production + Preview).
//   - For local dev, put it in .env.local in the repo root. Vite's dev plugin
//     (see vite.config.js) imports this same file and runs it under Node.
//
// Security:
//   - Only the client_secret + expiry are returned. The server-side API key
//     never touches the response body.
//   - CORS is locked to the same origin by default; in dev the Vite plugin
//     short-circuits the same-origin check.

import { PRAVASI_SETU_VOICE_PERSONA } from './_persona.js'

const OPENAI_REALTIME_SESSION_URL = 'https://api.openai.com/v1/realtime/sessions'

export default async function handler(req, res) {
  // Allow either GET (simple) or POST (preferred). Reject everything else.
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'missing_server_key',
      message: 'OPENAI_API_KEY is not configured on the server.',
    })
  }

  try {
    const r = await fetch(OPENAI_REALTIME_SESSION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model:        PRAVASI_SETU_VOICE_PERSONA.model,
        voice:        PRAVASI_SETU_VOICE_PERSONA.voice,
        instructions: PRAVASI_SETU_VOICE_PERSONA.instructions,
        // Reasonable defaults; the client may override these via session.update.
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: 'server_vad', threshold: 0.55 },
        modalities: ['audio', 'text'],
      }),
    })

    if (!r.ok) {
      const detail = await safeJson(r)
      return res.status(r.status).json({
        error: 'openai_session_failed',
        status: r.status,
        // Don't leak headers; surface only OpenAI's user-facing error message.
        message: detail?.error?.message || 'OpenAI rejected the session request.',
      })
    }

    const data = await r.json()

    // Return ONLY the ephemeral client secret + metadata the browser needs.
    // Strip everything else so we never echo internal fields to the client.
    return res.status(200).json({
      client_secret: data.client_secret,
      expires_at:    data.expires_at,
      model:         data.model || PRAVASI_SETU_VOICE_PERSONA.model,
      voice:         data.voice || PRAVASI_SETU_VOICE_PERSONA.voice,
    })
  } catch (e) {
    return res.status(502).json({
      error: 'upstream_unreachable',
      message: 'Could not reach OpenAI. Check the server connection and retry.',
    })
  }
}

async function safeJson(r) {
  try { return await r.json() } catch { return null }
}
