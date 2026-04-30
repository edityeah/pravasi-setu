import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { APPLICATIONS, TRANSFERS, GRIEVANCES, CERTIFICATES, PRE_DEPARTURE_CHECKLIST } from '../data/mockData'
import {
  loadSession, saveSession, clearSession,
  loadProfile, saveProfile,
  loadAppState, saveAppState,
  loadLanguage, saveLanguage,
  loadSlice, saveSlice,
  STORAGE_KEYS,
} from '../utils/storage'

// Prototype-only local persistence. Replace with secure backend / session
// storage in production.

const AppContext = createContext(null)

const DEFAULT_PROFILE = {
  name: 'Ramesh Kumar',
  phone: '+91 98765 43210',
  age: 28,
  dob: '1997-07-14',
  gender: 'Male',
  location: 'Lucknow, Uttar Pradesh',
  education: '10th Pass',
  aadhaarVerified: true,
  apaarVerified: true,
  digilockerLinked: true,
  pccVerified: false,
  skills: [
    { name: 'Electrician', level: 'Skilled',       verified: true,  years: 5 },
    { name: 'Welding',     level: 'Semi-skilled',  verified: true,  years: 2 },
    { name: 'Plumbing',    level: 'Beginner',      verified: false, years: 1 },
  ],
  certifications: CERTIFICATES,
  experience: [
    { role: 'Electrician',         company: 'L&T Construction', duration: '2019 – 2023', country: 'India' },
    { role: 'Maintenance Helper',  company: 'Tata Projects',    duration: '2018 – 2019', country: 'India' },
  ],
}

const DEFAULT_SESSION = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  kycStatus: 'pending',
  createdAt: null,
}

// Routes that should never be restored on refresh — if the persisted
// lastRoute is one of these, fall back to home for an authenticated user.
const TRANSIENT_ROUTES = new Set(['splash', 'login', 'otp', 'kyc'])

// Sensible "back from here goes to here" fallbacks. Used when the
// in-session navigation stack has only one entry — most commonly because
// the user landed on a deep route via session-restore or a chat deep-link.
const BACK_FALLBACKS = {
  // Skill-passport family
  resumeBuilder:      'passport',
  certificate:        'passport',
  passport:           'profile',
  profileSetup:       'profile',
  // Jobs family
  jobDetail:          'jobs',
  jobApplyChoice:     'jobDetail',
  applicationTracker: 'home',
  employerProfile:    'jobs',
  rateEmployer:       'jobDetail',
  // Remittance / financial / mobility
  transferTracker:    'remittance',
  loans:              'predeparture',
  insurance:          'predeparture',
  travel:             'predeparture',
  // Grievance / safety
  ticketDetail:       'grievance',
  emergency:          'home',
  grievance:          'home',
  // Lifecycle dashboards
  predeparture:       'home',
  postarrival:        'home',
  remittance:         'home',
  employment:         'home',
  return:             'home',
  // Misc
  profile:            'home',
  updates:            'home',
  chat:               'home',
}

function pickInitialScreen(session, persistedAppState) {
  if (!session?.isAuthenticated) {
    // No session — start at splash (language pick) unless one was already chosen.
    if (loadLanguage()) return 'login'
    return 'splash'
  }
  const last = persistedAppState?.lastRoute
  if (last && !TRANSIENT_ROUTES.has(last)) return last
  return 'home'
}

export function AppProvider({ children }) {
  // Hydrate from localStorage on first render.
  const persistedSession  = loadSession()  || DEFAULT_SESSION
  const persistedProfile  = loadProfile()  || DEFAULT_PROFILE
  const persistedAppState = loadAppState() || {}
  const persistedLang     = loadLanguage() || 'en'

  const [session,      setSession]      = useState(persistedSession)
  const [profile,      setProfile]      = useState(persistedProfile)
  const [lang,         setLang]         = useState(persistedLang)
  const [applications, setApplications] = useState(() => loadSlice(STORAGE_KEYS.applications, null) || APPLICATIONS)
  const [transfers,    setTransfers]    = useState(() => loadSlice(STORAGE_KEYS.transfers,    null) || TRANSFERS)
  const [tickets,      setTickets]      = useState(() => loadSlice(STORAGE_KEYS.tickets,      null) || GRIEVANCES)
  const [certificates, setCertificates] = useState(() => loadSlice(STORAGE_KEYS.certificates, null) || CERTIFICATES)
  const [checklist,    setChecklist]    = useState(() => loadSlice(STORAGE_KEYS.checklist,    null) || PRE_DEPARTURE_CHECKLIST)

  // ── Financial & Mobility Services slices (loans / insurance / travel) ───
  const [loanApplications,   setLoanApplications]   = useState(() => loadSlice(STORAGE_KEYS.loanApplications,   null) || [])
  const [insurancePolicies,  setInsurancePolicies]  = useState(() => loadSlice(STORAGE_KEYS.insurancePolicies,  null) || [])
  const [travelBookings,     setTravelBookings]     = useState(() => loadSlice(STORAGE_KEYS.travelBookings,     null) || [])
  const [manualApplications, setManualApplications] = useState(() => loadSlice(STORAGE_KEYS.manualApplications, null) || [])
  const [beneficiaries,      setBeneficiaries]      = useState(() => loadSlice(STORAGE_KEYS.beneficiaries,      null) || [])

  // ── Resume Builder ──────────────────────────────────────────────────────
  const [resume, setResumeState] = useState(() =>
    loadSlice(STORAGE_KEYS.resume, null) || buildResumeFromProfile(persistedProfile)
  )
  const setResume = useCallback((updater) => {
    setResumeState(r => {
      const next = typeof updater === 'function' ? updater(r) : updater
      return { ...next, lastUpdated: Date.now() }
    })
  }, [])

  const initialScreen = pickInitialScreen(persistedSession, persistedAppState)
  const [screen, setScreen] = useState(initialScreen)
  const [stack,  setStack]  = useState([initialScreen])
  const [params, setParams] = useState(persistedAppState?.lastParams || {})
  const [toast,  setToast]  = useState({ message: '', type: '', visible: false })
  const toastTimer = useRef(null)

  // ── Persist on change ───────────────────────────────────────────────────
  useEffect(() => { saveSession(session)   }, [session])
  useEffect(() => { saveProfile(profile)   }, [profile])
  useEffect(() => { saveLanguage(lang)     }, [lang])
  useEffect(() => { saveSlice(STORAGE_KEYS.applications, applications) }, [applications])
  useEffect(() => { saveSlice(STORAGE_KEYS.transfers,    transfers)    }, [transfers])
  useEffect(() => { saveSlice(STORAGE_KEYS.tickets,      tickets)      }, [tickets])
  useEffect(() => { saveSlice(STORAGE_KEYS.certificates, certificates) }, [certificates])
  useEffect(() => { saveSlice(STORAGE_KEYS.checklist,          checklist)          }, [checklist])
  useEffect(() => { saveSlice(STORAGE_KEYS.loanApplications,   loanApplications)   }, [loanApplications])
  useEffect(() => { saveSlice(STORAGE_KEYS.insurancePolicies,  insurancePolicies)  }, [insurancePolicies])
  useEffect(() => { saveSlice(STORAGE_KEYS.travelBookings,     travelBookings)     }, [travelBookings])
  useEffect(() => { saveSlice(STORAGE_KEYS.manualApplications, manualApplications) }, [manualApplications])
  useEffect(() => { saveSlice(STORAGE_KEYS.beneficiaries,      beneficiaries)      }, [beneficiaries])
  useEffect(() => { saveSlice(STORAGE_KEYS.resume,             resume)             }, [resume])
  useEffect(() => { saveAppState({ lastRoute: screen, lastParams: params }) }, [screen, params])

  // ── Navigation ──────────────────────────────────────────────────────────
  const navigate = useCallback((id, p = {}) => {
    setParams(p)
    setStack(s => [...s, id])
    setScreen(id)
  }, [])

  // Pop the navigation stack. If the stack only has the current route
  // (e.g. user landed here via session restore or a chat deep-link), fall
  // back to a sensible default from BACK_FALLBACKS, then 'home'.
  const goBack = useCallback(() => {
    setStack(s => {
      if (s.length > 1) {
        const next = s.slice(0, -1)
        setScreen(next[next.length - 1])
        setParams({})
        return next
      }
      const current = s[s.length - 1]
      const fallback = BACK_FALLBACKS[current] || 'home'
      setScreen(fallback)
      setParams({})
      return [fallback]
    })
  }, [])

  const goHome = useCallback(() => {
    setStack(['home'])
    setScreen('home')
  }, [])

  // ── Toast ───────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = '') => {
    setToast({ message, type, visible: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setToast(t => ({ ...t, visible: false }))
    }, 2400)
  }, [])

  // ── Auth ────────────────────────────────────────────────────────────────
  const signIn = useCallback((opts = {}) => {
    setSession(s => ({
      ...s,
      isAuthenticated: true,
      hasCompletedOnboarding: opts.hasCompletedOnboarding ?? s.hasCompletedOnboarding,
      kycStatus: opts.kycStatus ?? s.kycStatus,
      createdAt: s.createdAt || Date.now(),
    }))
  }, [])

  const completeKYC = useCallback(() => {
    setSession(s => ({
      ...s,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      kycStatus: 'verified',
      createdAt: s.createdAt || Date.now(),
    }))
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(DEFAULT_SESSION)
    setProfile(DEFAULT_PROFILE)
    setApplications(APPLICATIONS)
    setTransfers(TRANSFERS)
    setTickets(GRIEVANCES)
    setCertificates(CERTIFICATES)
    setChecklist(PRE_DEPARTURE_CHECKLIST)
    setLoanApplications([])
    setInsurancePolicies([])
    setTravelBookings([])
    setManualApplications([])
    setBeneficiaries([])
    setResumeState(buildResumeFromProfile(DEFAULT_PROFILE))
    setStack(['login'])
    setScreen('login')
    setParams({})
  }, [])

  // ── Slice mutators (used by pages) ──────────────────────────────────────
  const addApplication       = useCallback((app) => setApplications(a => [app, ...a]), [])
  const addTransfer          = useCallback((t)   => setTransfers(arr => [t, ...arr]), [])
  const addTicket            = useCallback((t)   => setTickets(arr => [t, ...arr]), [])
  const addLoanApplication   = useCallback((l)   => setLoanApplications(a => [l, ...a]), [])
  const updateLoanApplication= useCallback((id, patch) => setLoanApplications(a => a.map(x => x.id === id ? { ...x, ...patch } : x)), [])
  const addInsurancePolicy   = useCallback((p)   => setInsurancePolicies(a => [p, ...a]), [])
  const updateInsurancePolicy= useCallback((id, patch) => setInsurancePolicies(a => a.map(x => x.id === id ? { ...x, ...patch } : x)), [])
  const addTravelBooking     = useCallback((b)   => setTravelBookings(a => [b, ...a]), [])
  const updateTravelBooking  = useCallback((id, patch) => setTravelBookings(a => a.map(x => x.id === id ? { ...x, ...patch } : x)), [])
  const addManualApplication = useCallback((a)   => setManualApplications(arr => [a, ...arr]), [])
  const addBeneficiary       = useCallback((b)   => setBeneficiaries(arr => [b, ...arr]), [])

  return (
    <AppContext.Provider value={{
      // navigation
      screen, navigate, goBack, goHome, params,
      // localisation
      lang, setLang,
      // user
      profile, setProfile,
      // toast
      toast, showToast,
      // session / auth
      session,
      isAuthenticated: session.isAuthenticated,
      signIn, completeKYC, signOut,
      // persisted slices
      applications, addApplication,
      transfers,    addTransfer,
      tickets,      addTicket,
      certificates, setCertificates,
      checklist,    setChecklist,
      // financial & mobility services
      loanApplications,   addLoanApplication,   updateLoanApplication,
      insurancePolicies,  addInsurancePolicy,   updateInsurancePolicy,
      travelBookings,     addTravelBooking,     updateTravelBooking,
      manualApplications, addManualApplication,
      beneficiaries,      addBeneficiary,
      resume,             setResume,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// Seed resume data from the profile mock when no persisted resume exists.
function buildResumeFromProfile(profile) {
  if (!profile) return defaultResume()
  return {
    template: 'overseas',
    visibility: 'private',
    lastUpdated: Date.now(),
    personal: {
      name:                 profile.name || '',
      phone:                profile.phone || '',
      email:                profile.email || '',
      location:             profile.location || '',
      preferredCountry:     profile.preferredCountry || 'UAE',
      preferredRole:        profile.skills?.[0]?.name || 'Skilled worker',
      passportAvailable:    true,
      kycVerified:          !!profile.aadhaarVerified,
      passportId:           profile.passportNumber || 'A1234567',
      skillPassportId:      'PS-9847-3221',
    },
    summary: 'Skilled overseas-ready worker verified through Pravasi Setu. NSDC-linked credentials, Aadhaar/DigiLocker KYC complete, ready for deployment in GCC countries.',
    skills: (profile.skills || []).map(s => ({
      id: `sk-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: s.name,
      level: s.level || 'Skilled',
      years: s.years || 1,
      verified: !!s.verified,
    })),
    certifications: (profile.certifications || []).map(c => ({
      id: c.id || `cert-${Math.random().toString(36).slice(2, 8)}`,
      name: c.name,
      issuer: c.issuer,
      year: c.year,
      verified: !!c.verified,
      certNumber: c.certNumber || '',
      expiry: c.expiry || '',
    })),
    experience: (profile.experience || []).map((e, i) => ({
      id: `exp-${i}`,
      title: e.role,
      company: e.company,
      country: e.country,
      duration: e.duration,
      current: false,
      responsibilities: '',
      tools: '',
    })),
    education: [
      { id: 'edu-1', qualification: profile.education || '10th Pass', institution: '', year: '', field: '' },
    ],
    languages: [
      { id: 'lang-1', name: 'Hindi',   speaking: 'Native',  reading: 'Native',  writing: 'Native' },
      { id: 'lang-2', name: 'English', speaking: 'Conversational', reading: 'Conversational', writing: 'Basic' },
    ],
    documents: [
      { id: 'doc-passport',  label: 'Passport',           status: 'available' },
      { id: 'doc-aadhaar',   label: 'Aadhaar',            status: 'available' },
      { id: 'doc-pcc',       label: 'Police Clearance',   status: 'pending' },
      { id: 'doc-medical',   label: 'GAMCA Medical',      status: 'available' },
      { id: 'doc-visa',      label: 'Work Visa',          status: 'pending' },
      { id: 'doc-contract',  label: 'Job Contract',       status: 'available' },
      { id: 'doc-insurance', label: 'PBBY Insurance',     status: 'available' },
    ],
    references: [],
  }
}

function defaultResume() {
  return {
    template: 'clean',
    visibility: 'private',
    lastUpdated: Date.now(),
    personal: { name: '', phone: '', email: '', location: '', preferredCountry: '', preferredRole: '',
                passportAvailable: false, kycVerified: false, passportId: '', skillPassportId: '' },
    summary: '',
    skills: [],
    certifications: [],
    experience: [],
    education: [],
    languages: [],
    documents: [],
    references: [],
  }
}

export const useApp = () => useContext(AppContext)
