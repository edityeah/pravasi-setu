import React, { Suspense, lazy } from 'react'
import { X, Maximize2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getAppById } from './intentRouter'
import { EmbeddedProvider } from './EmbeddedContext'

// Lazy-mount each Pravasi page inside the canvas. They're full self-contained
// pages with their own StatusBar/TopBar — we drop those visual elements by
// rendering inside a "panel" wrapper. The pages still render and remain
// fully interactive (state, navigation, validation all work).
const PAGE_LOADERS = {
  jobs:               () => import('../pages/JobsPage'),
  jobDetail:          () => import('../pages/JobDetailPage'),
  remittance:         () => import('../pages/RemittancePage'),
  transferTracker:    () => import('../pages/TransferTrackerPage'),
  calculator:         () => import('../pages/CalculatorPage'),
  predeparture:       () => import('../pages/PreDeparturePage'),
  postarrival:        () => import('../pages/PostArrivalPage'),
  grievance:          () => import('../pages/GrievancePage'),
  emergency:          () => import('../pages/EmergencyAssistancePage'),
  passport:           () => import('../pages/SkillPassportPage'),
  resumeBuilder:      () => import('../pages/ResumeBuilderPage'),
  profileSetup:       () => import('../pages/ProfileSetupPage'),
  loans:              () => import('../pages/LoansPage'),
  insurance:          () => import('../pages/InsurancePage'),
  travel:             () => import('../pages/TravelPage'),
  employment:         () => import('../pages/EmploymentPage'),
  applicationTracker: () => import('../pages/ApplicationTrackerPage'),
  return:             () => import('../pages/ReturnPage'),
  updates:            () => import('../pages/UpdatesPage'),
  profile:            () => import('../pages/ProfilePage'),
}

const cache = {}
function getLazy(target) {
  if (!cache[target] && PAGE_LOADERS[target]) {
    cache[target] = lazy(PAGE_LOADERS[target])
  }
  return cache[target] || null
}

export default function CanvasPanel({ open, app, onClose, onMinimize }) {
  const { navigate } = useApp()
  if (!open || !app) return null

  const Lazy = getLazy(app.target)
  const Icon = app.icon

  return (
    <div className="flex flex-col h-full bg-surface-secondary border-l border-bdr-light overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center gap-2 px-3 border-b border-bdr-light bg-white flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-txt-primary truncate">{app.title}</div>
          <div className="text-[11px] text-txt-secondary truncate">{app.summary}</div>
        </div>
        <button
          onClick={() => { navigate(app.target); onClose && onClose() }}
          className="hidden sm:flex w-9 h-9 rounded-full hover:bg-surface-secondary text-txt-secondary items-center justify-center"
          aria-label="Open full screen"
          title="Open full screen"
        >
          <Maximize2 size={16} />
        </button>
        {/* Prominent close — visible on every viewport, with a tinted hit area
            so it never gets lost in the page chrome. */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-danger-light text-danger hover:bg-danger hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close canvas"
          title="Close canvas"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body — mount the existing Pravasi page. EmbeddedProvider tells the
          page's StatusBar / BottomNav to render null so we don't duplicate
          phone chrome on top of the desktop chat shell. */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {Lazy ? (
          <EmbeddedProvider>
            <Suspense fallback={<Loading />}>
              <Lazy />
            </Suspense>
          </EmbeddedProvider>
        ) : (
          <div className="p-6 text-center text-txt-secondary text-[13px]">
            This feature isn't wired into the canvas yet.
          </div>
        )}
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-txt-secondary">
      <div className="w-8 h-8 rounded-full border-2 border-primary-light border-t-primary animate-spin mb-3" />
      <div className="text-[12px]">Loading…</div>
    </div>
  )
}
