// Vercel Serverless Function — POST /api/analyze-screen
//
// Takes a base64-encoded screenshot frame and returns a SHORT one-sentence
// description of what the user is currently looking at inside Pravasi Setu.
// The voice agent uses this summary as visual context so it can guide the
// caller step-by-step ("I can see you're on Find Jobs — tap Apply on the
// first card").
//
// Why this endpoint exists:
//   The OpenAI Realtime API (used by the live voice session) does not yet
//   accept image input over WebRTC. So instead of streaming pixels into the
//   realtime session, the browser captures a frame every few seconds, posts
//   it here, and we relay it to GPT-4o vision. The returned summary is then
//   injected back into the realtime session via its data channel as a
//   system-style note.
//
// Security:
//   - OPENAI_API_KEY is read SERVER-SIDE only.
//   - The image never touches storage; it's forwarded to OpenAI in-memory
//     and dropped.
//   - Body size is hard-capped to ~6 MB to defend against payload abuse.

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const VISION_MODEL = 'gpt-4o-mini'
const MAX_BODY_BYTES = 6 * 1024 * 1024

const SYSTEM_PROMPT = `
You are a visual-context summariser for the Pravasi Setu voice assistant.

You will receive a screenshot of the user's screen. Reply with EXACTLY ONE
sentence (max 30 words) describing what the user is currently looking at
inside the Pravasi Setu app:
- the page or screen name (Find Jobs, Send Money, Skill Passport, Pre-Departure,
  Grievance, Emergency, Resume Builder, KYC, etc.)
- the most prominent visible info (e.g. a job title, a button waiting to be
  clicked, a form being filled, a status badge)
- which control the user would tap next, if obvious

If the screenshot is NOT Pravasi Setu (browser chrome, blank, another app,
sensitive data) reply: "Not Pravasi Setu — likely browser chrome or a
different app."

Rules:
- ONE sentence only.
- No greetings, no quotes, no markdown, no lead-in like "The user is...".
- Speak in present tense, third person.
- Do NOT speculate beyond what is visible.
- Never invent fees, eligibility, or numbers that aren't on screen.
`.trim()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'missing_server_key',
      message: 'OPENAI_API_KEY is not configured on the server.',
    })
  }

  // Vercel parses JSON automatically when Content-Type is application/json,
  // but the dev middleware passes through whatever shape it has. Accept both.
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { return res.status(400).json({ error: 'invalid_json' }) }
  }
  const image_base64 = body?.image_base64
  const mime = (body?.mime || 'image/jpeg').toString()

  if (!image_base64 || typeof image_base64 !== 'string') {
    return res.status(400).json({ error: 'missing_image' })
  }
  // base64 length × 3/4 ≈ raw bytes
  if (image_base64.length * 0.75 > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'image_too_large' })
  }

  try {
    const r = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Summarise this screen in one sentence.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mime};base64,${image_base64}`,
                  // "low" detail keeps token cost ~85 tokens per image and is
                  // plenty for "what page am I on" questions.
                  detail: 'low',
                },
              },
            ],
          },
        ],
        max_tokens: 80,
        temperature: 0.2,
      }),
    })

    if (!r.ok) {
      const detail = await safeJson(r)
      return res.status(r.status).json({
        error: 'openai_failed',
        message: detail?.error?.message || 'OpenAI rejected the vision request.',
      })
    }

    const data = await r.json()
    const summary = (data?.choices?.[0]?.message?.content || '').trim()
    return res.status(200).json({ summary })
  } catch (e) {
    return res.status(502).json({
      error: 'upstream_unreachable',
      message: 'Could not reach OpenAI vision endpoint.',
    })
  }
}

async function safeJson(r) { try { return await r.json() } catch { return null } }
