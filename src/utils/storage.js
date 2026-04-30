// Prototype-only local persistence. Replace with secure backend / session
// storage in production — none of these helpers are appropriate for real PII.
//
// Each AppContext slice gets its own key so reads/writes are cheap and a single
// corrupted blob can't invalidate the whole state.

const NS = 'pravasi'
export const STORAGE_KEYS = {
  session:            `${NS}_session`,
  profile:            `${NS}_profile`,
  appState:           `${NS}_app_state`,
  language:           `${NS}_language`,
  applications:       `${NS}_applications`,
  transfers:          `${NS}_transfers`,
  tickets:            `${NS}_tickets`,
  certificates:       `${NS}_certificates`,
  checklist:          `${NS}_checklist`,
  loanApplications:   `${NS}_loan_applications`,
  insurancePolicies:  `${NS}_insurance_policies`,
  travelBookings:     `${NS}_travel_bookings`,
  manualApplications: `${NS}_manual_applications`,
  beneficiaries:      `${NS}_beneficiaries`,
  resume:             `${NS}_resume_data`,
}

const hasStorage = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const k = `${NS}_probe`
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
})()

export function safeJsonParse(value, fallback = null) {
  if (value == null) return fallback
  try { return JSON.parse(value) } catch { return fallback }
}

function read(key, fallback = null) {
  if (!hasStorage) return fallback
  return safeJsonParse(window.localStorage.getItem(key), fallback)
}
function write(key, value) {
  if (!hasStorage) return
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}
function remove(key) {
  if (!hasStorage) return
  try { window.localStorage.removeItem(key) } catch { /* noop */ }
}

// ── Session ────────────────────────────────────────────────────────────────
export function loadSession() {
  return read(STORAGE_KEYS.session, null)
}
export function saveSession(session) {
  write(STORAGE_KEYS.session, session)
}
export function clearSession() {
  // Wipes auth + every persisted user-generated slice, keeps language so the
  // user doesn't have to re-pick it on next login.
  remove(STORAGE_KEYS.session)
  remove(STORAGE_KEYS.profile)
  remove(STORAGE_KEYS.appState)
  remove(STORAGE_KEYS.applications)
  remove(STORAGE_KEYS.transfers)
  remove(STORAGE_KEYS.tickets)
  remove(STORAGE_KEYS.certificates)
  remove(STORAGE_KEYS.checklist)
  remove(STORAGE_KEYS.loanApplications)
  remove(STORAGE_KEYS.insurancePolicies)
  remove(STORAGE_KEYS.travelBookings)
  remove(STORAGE_KEYS.manualApplications)
  remove(STORAGE_KEYS.beneficiaries)
  remove(STORAGE_KEYS.resume)
}

// ── Profile ────────────────────────────────────────────────────────────────
export function loadProfile()    { return read(STORAGE_KEYS.profile, null) }
export function saveProfile(p)   { write(STORAGE_KEYS.profile, p) }

// ── Last route / params ────────────────────────────────────────────────────
export function loadAppState()   { return read(STORAGE_KEYS.appState, null) }
export function saveAppState(s)  { write(STORAGE_KEYS.appState, s) }

// ── Language ───────────────────────────────────────────────────────────────
export function loadLanguage()   { return read(STORAGE_KEYS.language, null) }
export function saveLanguage(l)  { write(STORAGE_KEYS.language, l) }

// ── Generic per-slice helpers (applications / transfers / tickets / …) ────
export function loadSlice(key, fallback) { return read(key, fallback) }
export function saveSlice(key, value)    { write(key, value) }

// ── Dev helper ─────────────────────────────────────────────────────────────
export function resetPrototypeData() {
  if (!hasStorage) return
  Object.values(STORAGE_KEYS).forEach(remove)
}
