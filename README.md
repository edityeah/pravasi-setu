# Pravasi Setu — Prototype

Govt-of-India migrant-worker companion app. React + Vite + Tailwind, with an
agentic chat shell, 18 in-app features (jobs, remittance, grievance, KYC,
resume builder, etc.) and a browser-based realtime voice assistant powered by
OpenAI's Realtime API over WebRTC.

---

## Realtime voice assistant — setup

The "Talk to Pravasi Setu Assistant" button uses OpenAI's Realtime API. The
browser **never** sees `OPENAI_API_KEY`; instead it asks our serverless route
([api/realtime-session.js](api/realtime-session.js)) to mint a short-lived
ephemeral client secret, which is what authenticates the WebRTC handshake.

### 1. Provision an OpenAI key

1. Go to <https://platform.openai.com/api-keys> and create a key with access
   to the Realtime models (`gpt-4o-realtime-preview-*`).
2. Copy the key — you'll only see it once.

### 2. Local development

```bash
# 1. Copy the example env file and paste your key
cp .env.local.example .env.local
# then edit .env.local and set OPENAI_API_KEY=sk-...

# 2. Install deps
npm install

# 3. Run the dev server (Vite + the bundled /api dev middleware)
npm run dev
```

`npm run dev` serves the SPA AND the `/api/realtime-session` route together,
so you can test the voice agent end-to-end without `vercel dev`. Open
`http://localhost:5173/`, click **Talk to Pravasi Setu Assistant**, allow
microphone access, and start speaking.

`.env.local` is gitignored — never commit your real key.

### 3. Deploy to Vercel

```bash
# First-time deploy (creates the project)
npx vercel

# Subsequent deploys via git
git push        # auto-deploy via Vercel's GitHub integration
# or
npx vercel --prod
```

Then set the key in Vercel project settings:

1. <https://vercel.com/your-team/pravasi-setu-prototype/settings/environment-variables>
2. **Add New** → Name: `OPENAI_API_KEY`, Value: `sk-...`, Environments:
   Production + Preview + Development.
3. Redeploy (Vercel picks up the new env on the next deploy).

Vercel automatically handles `/api/*.js` files as serverless functions, so no
extra config is required.

### How the secret is protected

- `OPENAI_API_KEY` is only ever read by `process.env` inside
  `api/realtime-session.js`. It never appears in the browser bundle.
- The frontend (`src/agentic/voice/useRealtimeVoice.js`) calls
  `POST /api/realtime-session` and receives only `{ client_secret, expires_at,
  model, voice }`. The ephemeral secret expires within ~1 minute and can only
  be used to open a single Realtime session.
- WebRTC SDP exchange happens directly between the browser and OpenAI using
  the ephemeral key — our backend is not in the audio path.

### Voice-agent persona

System instructions live in [api/_persona.js](api/_persona.js) and are sent
with every session-mint. The assistant:

- Speaks English / Hindi / Malayalam / Tamil / Bengali / Odia.
- Asks one question at a time, keeps replies short.
- Helps with all 15 Pravasi Setu features (KYC, jobs, remittance, grievance,
  emergency, etc.).
- Refuses to invent eligibility / fees / official numbers — surfaces the
  in-app screen instead.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server (port 5173) + bundled `/api` dev middleware. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Preview the built bundle locally. |

---

## Troubleshooting the voice button

| Symptom | Likely cause / fix |
| --- | --- |
| **"Microphone access was blocked"** | Browser denied mic permission. Click the lock icon → Site settings → Microphone → Allow → reload. |
| **"The voice assistant is not configured on the server"** | `OPENAI_API_KEY` is missing in Vercel / `.env.local`. Set it and redeploy. |
| **"Could not reach the voice-session backend"** | Frontend couldn't reach `/api/realtime-session`. In dev, make sure you used `npm run dev` (not `vite` directly) so the API middleware is registered. |
| **"OpenAI rejected the connection"** | Ephemeral key expired (>1 min between mint and use), or the key on the server lacks Realtime access. Re-mint and check the OpenAI dashboard. |
| **The call drops mid-sentence** | Network glitch — the UI surfaces a `network_lost` error. Tap **Try again**. |
