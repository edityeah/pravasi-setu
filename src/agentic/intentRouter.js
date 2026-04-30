// Maps a free-text user message to a Pravasi feature ("canvas app"). Each app
// is one of the existing pages — we mount it inside CanvasPanel so the user
// can interact with the actual feature without leaving the chat.
//
// The matcher is intentionally simple: phrase matching over a handful of
// keyword sets. Add an entry per feature; first match wins.

import {
  Briefcase, Wallet, BadgeIndianRupee, Calculator, ListChecks, Plane, AlertTriangle,
  FileText, RotateCcw, Award, Bell, Building, Home as HomeIcon,
  Siren, Receipt, Shield, BookUser, Sparkles, ClipboardList
} from 'lucide-react'

// Tone palette — each tile picks a different colour family so the grid reads
// as a colourful menu instead of a wall of blue. Backgrounds stay light tints
// (no eye-strain); icons take the saturated colour. Defined here so both the
// welcome grid and intent reply cards stay consistent.
export const TONES = {
  blue:    { bg: 'bg-blue-100',    fg: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-100', fg: 'text-emerald-600' },
  rose:    { bg: 'bg-rose-100',    fg: 'text-rose-600' },
  amber:   { bg: 'bg-amber-100',   fg: 'text-amber-700' },
  violet:  { bg: 'bg-violet-100',  fg: 'text-violet-700' },
  sky:     { bg: 'bg-sky-100',     fg: 'text-sky-600' },
  teal:    { bg: 'bg-teal-100',    fg: 'text-teal-700' },
  indigo:  { bg: 'bg-indigo-100',  fg: 'text-indigo-600' },
  red:     { bg: 'bg-red-100',     fg: 'text-red-600' },
  fuchsia: { bg: 'bg-fuchsia-100', fg: 'text-fuchsia-700' },
}

// Apps a user can invoke directly from chat.
// `target` matches keys in App.jsx ROUTES so CanvasPanel can render them.
export const APPS = [
  { id: 'jobs',               target: 'jobs',               icon: Briefcase,         tone: 'blue',    title: 'Find Jobs',          summary: 'Verified migrant jobs across GCC + SE Asia',
    keys: ['job', 'jobs', 'work', 'employment abroad', 'find job', 'opening', 'vacancy', 'electrician', 'nurse', 'plumber', 'driver', 'welder', 'helper'] },
  { id: 'remittance',         target: 'remittance',         icon: BadgeIndianRupee,  tone: 'emerald', title: 'Send Money',         summary: 'Compare rates, send INR home in minutes',
    keys: ['send money', 'remittance', 'remit', 'transfer', 'wire', 'wise', 'home transfer', 'aed to inr', 'qar to inr'] },
  { id: 'transferTracker',    target: 'transferTracker',    icon: Receipt,           tone: 'violet',  title: 'Track Transfers',    summary: 'Status of past money transfers',
    keys: ['track transfer', 'my transfers', 'track money', 'transfer history', 'where is my money'] },
  { id: 'calculator',         target: 'calculator',         icon: Calculator,        tone: 'amber',   title: 'Cost Calculator',    summary: 'Visa + agent + travel + living estimates',
    keys: ['cost', 'how much', 'calculator', 'estimate', 'budget', 'afford', 'expense'] },
  { id: 'predeparture',       target: 'predeparture',       icon: ListChecks,        tone: 'indigo',  title: 'Pre-Departure',      summary: 'Documents, vaccines, insurance, language',
    keys: ['pre departure', 'predeparture', 'before travel', 'checklist', 'documents', 'pcc', 'vaccine', 'gamca'] },
  { id: 'postarrival',        target: 'postarrival',        icon: HomeIcon,          tone: 'teal',    title: 'Post-Arrival',       summary: 'Housing, SIM, transport, embassy',
    keys: ['after arrival', 'post arrival', 'housing', 'sim', 'transport', 'community', 'embassy', 'arrival'] },
  { id: 'grievance',          target: 'grievance',          icon: AlertTriangle,     tone: 'rose',    title: 'Grievance',          summary: 'Raise + track complaints with embassy / MEA',
    keys: ['grievance', 'complaint', 'not paying', 'salary delay', 'employer issue', 'abuse', 'unsafe', 'cheating'] },
  { id: 'emergency',          target: 'emergency',          icon: Siren,             tone: 'red',     title: 'Emergency',          summary: '24×7 embassy + MADAD helplines',
    keys: ['emergency', 'urgent help', 'sos', 'help me now', 'in danger', '999', 'embassy contact'] },
  { id: 'passport',           target: 'passport',           icon: Award,             tone: 'fuchsia', title: 'Skill Passport',     summary: 'Verifiable digital resume + QR',
    keys: ['skill passport', 'my profile', 'verify skill', 'show resume', 'show passport'] },
  { id: 'resumeBuilder',      target: 'resumeBuilder',      icon: FileText,          tone: 'indigo',  title: 'Resume Builder',     summary: 'Edit, preview & download resume PDF',
    keys: ['resume', 'cv', 'build resume', 'edit resume', 'download resume', 'export pdf'] },
  { id: 'profileSetup',       target: 'profileSetup',       icon: BookUser,          tone: 'blue',    title: 'Profile Setup',      summary: 'Aadhaar, APAAR, DigiLocker',
    keys: ['profile setup', 'create profile', 'register me', 'sign up'] },
  { id: 'loans',              target: 'loans',              icon: Wallet,            tone: 'emerald', title: 'Migration Loans',    summary: 'Pre-approved loans for visa + travel',
    keys: ['loan', 'borrow', 'finance', 'credit'] },
  { id: 'insurance',          target: 'insurance',          icon: Shield,            tone: 'sky',     title: 'Insurance (PBBY)',   summary: 'PBBY + private health/travel cover',
    keys: ['insurance', 'pbby', 'health cover', 'travel insurance'] },
  { id: 'travel',             target: 'travel',             icon: Plane,             tone: 'sky',     title: 'Travel Bookings',    summary: 'Flights + visa + airport transfers',
    keys: ['flight', 'ticket', 'travel', 'book ticket', 'airline'] },
  { id: 'employment',         target: 'employment',         icon: Building,          tone: 'amber',   title: 'My Employment',      summary: 'Payslips, contract, attendance',
    keys: ['my employment', 'payslip', 'salary slip', 'attendance', 'my contract'] },
  { id: 'applicationTracker', target: 'applicationTracker', icon: ClipboardList,     tone: 'violet',  title: 'My Applications',    summary: 'Status of jobs you applied to',
    keys: ['my applications', 'applied jobs', 'application status', 'where is my application'] },
  { id: 'return',             target: 'return',             icon: RotateCcw,         tone: 'rose',    title: 'Return to India',    summary: 'Visa closure, ticket, India jobs',
    keys: ['return', 'come back', 'home india', 'reintegration', 'after contract'] },
  { id: 'updates',            target: 'updates',            icon: Bell,              tone: 'amber',   title: 'Updates & Alerts',   summary: 'Job, visa, payment, fraud alerts',
    keys: ['updates', 'alerts', 'notification', 'fraud alert'] },
]

const APPS_BY_ID = Object.fromEntries(APPS.map(a => [a.id, a]))

export function getAppById(id) { return APPS_BY_ID[id] || null }

// Best-effort intent matcher. Returns up to N apps that look relevant, each
// with a confidence score. The chat thread surfaces the top one as a primary
// "open" card and the rest as suggestion chips.
export function matchIntent(text, limit = 3) {
  if (!text || !text.trim()) return []
  const lc = text.toLowerCase()
  const scored = APPS.map(app => {
    let score = 0
    for (const k of app.keys) {
      if (lc.includes(k)) score += k.length // longer phrases are stronger signals
    }
    return { app, score }
  }).filter(s => s.score > 0)

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(s => s.app)
}

// Replies the assistant gives when surfacing each app. Short, action-oriented.
export function replyForApp(app) {
  const m = {
    jobs:               "Here are verified jobs matching your skills — open the panel to filter by country, salary or trust score.",
    remittance:         "Opened Send Money. I've pre-loaded the best provider for AED→INR — adjust the amount or recipient as you like.",
    transferTracker:    "Here's the status of every transfer you've sent. Tap any one for full timeline.",
    calculator:         "I've opened the migration cost calculator with default values. Move the sliders to model your destination.",
    predeparture:       "Pre-departure checklist + financial / health / legal services are ready in the panel.",
    postarrival:        "Settling-in essentials for the destination — housing, SIM, embassy and community groups.",
    grievance:          "I'll route your complaint to MEA, the Indian embassy and our legal team. Open the panel to file.",
    emergency:          "Emergency helplines surfaced. Long-press the call button to dial directly.",
    passport:           "Your verifiable digital skill passport — share via QR or download as PDF.",
    resumeBuilder:      "Resume builder is open. Edit any section, preview, then download a Pravasi-branded PDF.",
    profileSetup:       "Profile setup wizard — Aadhaar, APAAR, DigiLocker. Skip any step to come back later.",
    loans:              "Migration loans — partner banks pre-screened for your profile.",
    insurance:          "Insurance options including PBBY (govt-mandated) plus private add-ons.",
    travel:             "Flights + visa + airport transfer in one place.",
    employment:         "Your active employment record — payslips, contract, EMI.",
    applicationTracker: "All your job applications and their current stage.",
    return:             "Return-to-India workflow with visa closure, ticket and India job mapping.",
    updates:            "Latest alerts, fraud warnings and reminders.",
  }
  return m[app.id] || `Opened ${app.title}.`
}
