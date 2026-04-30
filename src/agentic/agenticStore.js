// Thread persistence + intent routing for the agentic shell.
//
// Threads live in localStorage. Each message can carry one or more
// `canvasInvocations` — references to which Pravasi feature the assistant
// surfaced in response. Clicking an invocation opens it in the right canvas.

const KEY_THREADS = 'pravasi.agentic.threads.v1'
const KEY_ACTIVE  = 'pravasi.agentic.activeThread.v1'

function ls() {
  try { return typeof window !== 'undefined' ? window.localStorage : null }
  catch { return null }
}
function readJson(k, fallback) {
  const s = ls(); if (!s) return fallback
  try { const raw = s.getItem(k); return raw ? (JSON.parse(raw) ?? fallback) : fallback }
  catch { return fallback }
}
function writeJson(k, v) {
  const s = ls(); if (!s) return
  try { s.setItem(k, JSON.stringify(v ?? null)) } catch { /* quota */ }
}

export function loadThreads()         { return readJson(KEY_THREADS, {}) }
export function saveThreads(threads)  { writeJson(KEY_THREADS, threads || {}) }
export function loadActiveThreadId()  { return readJson(KEY_ACTIVE, null) }
export function saveActiveThreadId(id) { writeJson(KEY_ACTIVE, id) }

function uid() {
  return `thr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function createThread({ title = 'New chat', initialMessages = [] } = {}) {
  const now = Date.now()
  const t = {
    id: uid(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: initialMessages,
    pinnedCanvas: null, // { app, params } — last app surfaced in this thread
  }
  const all = loadThreads()
  all[t.id] = t
  saveThreads(all)
  return t
}

export function appendMessage(threadId, msg) {
  const all = loadThreads()
  const t = all[threadId]
  if (!t) return null
  t.messages = [...(t.messages || []), { ...msg, ts: Date.now() }]
  t.updatedAt = Date.now()
  // Auto-title from first user message.
  if (t.title === 'New chat' && msg.role === 'user' && msg.text) {
    t.title = msg.text.slice(0, 60)
  }
  saveThreads(all)
  return t
}

export function setThreadCanvas(threadId, canvas) {
  const all = loadThreads()
  const t = all[threadId]
  if (!t) return null
  t.pinnedCanvas = canvas
  t.updatedAt = Date.now()
  saveThreads(all)
  return t
}

export function deleteThread(threadId) {
  const all = loadThreads()
  delete all[threadId]
  saveThreads(all)
}

export function renameThread(threadId, title) {
  const all = loadThreads()
  if (!all[threadId]) return
  all[threadId].title = title
  all[threadId].updatedAt = Date.now()
  saveThreads(all)
}

// ─── Recency grouping for the sidebar ──────────────────────────────────────
export function groupByRecency(threads, now = Date.now()) {
  const sorted = [...threads].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  const day = 24 * 60 * 60 * 1000
  const groups = { today: [], yesterday: [], thisWeek: [], earlier: [] }
  for (const t of sorted) {
    const age = now - (t.updatedAt || 0)
    if (age < day)        groups.today.push(t)
    else if (age < 2*day) groups.yesterday.push(t)
    else if (age < 7*day) groups.thisWeek.push(t)
    else                  groups.earlier.push(t)
  }
  return groups
}
