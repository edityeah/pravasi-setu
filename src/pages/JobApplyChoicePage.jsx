import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import AlertBanner from '../components/AlertBanner'
import { JOBS } from '../data/mockData'
import {
  Zap, Edit3, ChevronRight, ChevronLeft, ShieldCheck, Send, CheckCircle2,
  User as UserIcon, Briefcase, Award, FileText,
} from 'lucide-react'
import { isValidName, isValidIndianPhone } from '../utils/validation'

/* Job apply choice — Swift Apply (uses verified profile) vs Manual.
   On submit: pushes to applications (Swift) or manualApplications (Manual)
   then navigates to applicationTracker. See spec §9. */

const APPLY_TIMELINE = (today) => ([
  { step: 'Submitted',          date: today,    done: true, current: true },
  { step: 'Reviewed',           date: 'Pending', done: false },
  { step: 'Interview set',      date: 'Pending', done: false },
  { step: 'Offer rolled',       date: 'Pending', done: false },
  { step: 'Visa & travel',      date: 'Pending', done: false },
])

export default function JobApplyChoicePage() {
  const { params, navigate, profile, resume, addApplication, addManualApplication, applications, manualApplications, showToast } = useApp()
  const job = JOBS.find(j => j.id === params.jobId) || JOBS[0]
  const [mode, setMode] = useState('choose') // 'choose' | 'swift' | 'manual'

  if (!job) return null

  const submitSwift = (consent) => {
    if (!consent) { showToast('Please accept consent to share your verified profile'); return }
    const id = `APP-${3200 + applications.length + 1}`
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    addApplication({
      id,
      jobId: job.id,
      employerName: job.employerName,
      role: job.title,
      city: job.destinationCity,
      method: 'swift',
      appliedOn: today,
      status: 'Application submitted',
      nextStep: 'Recruiter to review verified profile within 48 hrs',
      timeline: APPLY_TIMELINE(today),
    })
    showToast(`Swift Apply ${id} submitted with verified profile`)
    navigate('applicationTracker', { applicationId: id })
  }

  const submitManual = (form) => {
    const id = `APM-${4400 + manualApplications.length + 1}`
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const application = {
      id,
      jobId: job.id,
      employerName: job.employerName,
      role: job.title,
      city: job.destinationCity,
      method: 'manual',
      appliedOn: today,
      status: 'Application submitted',
      nextStep: 'Recruiter will reconcile manual details — adds 24–48 hrs',
      timeline: APPLY_TIMELINE(today),
      manualForm: form,
    }
    addApplication(application)
    addManualApplication(application)
    showToast(`Manual application ${id} submitted`)
    navigate('applicationTracker', { applicationId: id })
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar
        title="Apply for this job"
        sub={`${job.title} · ${job.employerName}`}
        dark
        onBack={mode !== 'choose' ? () => setMode('choose') : undefined}
      />

      <div className="bg-primary text-white px-5 pb-5">
        <div className="max-w-screen-lg mx-auto w-full flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-pill bg-white/15 text-white text-[10px] font-bold">
            ✓ eMigrate-compatible · Verified migration route
          </span>
          <span className="text-[10px] opacity-80 ml-auto">
            Mock trust signal — production must integrate eMigrate APIs.
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 mt-3 space-y-3">
          {mode === 'choose' && <ChoiceCards setMode={setMode} job={job} profile={profile} resume={resume} navigate={navigate} />}
          {mode === 'swift'  && <SwiftApplyReview job={job} profile={profile} resume={resume} onSubmit={submitSwift} navigate={navigate} />}
          {mode === 'manual' && <ManualApplyForm  job={job} profile={profile} onSubmit={submitManual} />}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Choice cards ──────────────────────── */
function ChoiceCards({ setMode, job, profile, resume, navigate }) {
  const completeness = resume ? resumeCompleteness(resume) : profileCompleteness(profile)
  const checklist = resume ? buildResumeChecklist(resume) : []
  const lowReadiness = completeness < 60
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[10px] font-bold text-txt-tertiary uppercase tracking-wide">Applying for</div>
        <div className="text-[16px] font-extrabold text-txt-primary mt-0.5">{job.title}</div>
        <div className="text-[12px] text-txt-secondary">{job.employerName} · {job.destinationCity}</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          onClick={() => setMode('swift')}
          className="text-left bg-white rounded-2xl shadow-card border-2 border-primary p-5 hover:-translate-y-0.5 transition-all relative"
        >
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-pill bg-primary text-white text-[9px] font-bold">RECOMMENDED</span>
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
            <Zap size={22} />
          </div>
          <div className="text-[16px] font-extrabold text-txt-primary mt-3">Swift Apply</div>
          <p className="text-[12px] text-txt-secondary mt-1 leading-relaxed">
            Use your Pravasi profile + Skill Passport. Verified Aadhaar, NSDC certificates and resume are shared in one tap.
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-txt-secondary">
              <span>Profile completeness</span>
              <span className="font-bold text-primary">{completeness}%</span>
            </div>
            <div className="h-1.5 bg-bdr rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${completeness}%` }} />
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary">
            Review Swift Apply <ChevronRight size={14} />
          </div>
        </button>

        <button
          onClick={() => setMode('manual')}
          className="text-left bg-white rounded-2xl shadow-card border-2 border-bdr p-5 hover:border-primary hover:-translate-y-0.5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
            <Edit3 size={22} />
          </div>
          <div className="text-[16px] font-extrabold text-txt-primary mt-3">Manual entry</div>
          <p className="text-[12px] text-txt-secondary mt-1 leading-relaxed">
            Enter details manually for this application. Use this if your profile is incomplete or you want to change anything.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary">
            Start manual form <ChevronRight size={14} />
          </div>
        </button>
      </div>

      {lowReadiness && checklist.length > 0 && (
        <div className="bg-warn-light text-warn-text rounded-2xl p-4 border border-warn/30">
          <div className="text-[12px] font-bold mb-1">Complete your resume to strengthen Swift Apply</div>
          <ul className="text-[11px] space-y-0.5 mt-1">
            {checklist.slice(0, 5).map(c => <li key={c}>• {c}</li>)}
          </ul>
          <button
            onClick={() => navigate('resumeBuilder')}
            className="mt-3 bg-primary hover:bg-primary-dark text-white font-bold text-[12px] px-4 py-2 rounded-pill"
          >
            Open Resume Builder
          </button>
        </div>
      )}

      <AlertBanner tone="info" title="Verified migration route">
        Check recruiter and employer details before paying any fee. Pravasi Setu lists eMigrate-compatible employers — flagged employers are removed from search.
      </AlertBanner>
    </>
  )
}

/* ───────────────────────── Swift Apply review ─────────────────────── */
function SwiftApplyReview({ job, profile, resume, onSubmit, navigate }) {
  const [consent, setConsent] = useState(false)
  const completeness = resume ? resumeCompleteness(resume) : profileCompleteness(profile)
  const missing = missingItems(profile)
  const checklist = resume ? buildResumeChecklist(resume) : []

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-primary" />
          <div className="text-[15px] font-extrabold text-txt-primary">Swift Apply review</div>
        </div>
        <p className="text-[11px] text-txt-secondary mt-1">Verify what we'll send to {job.employerName}.</p>

        <Section icon={UserIcon} title="Profile">
          <KV k="Name"     v={profile.name} />
          <KV k="Phone"    v={profile.phone} />
          <KV k="Location" v={profile.location} />
          <KV k="Education" v={profile.education} />
        </Section>

        <Section icon={Briefcase} title="Skill Passport">
          <ul className="text-[12px] text-txt-secondary space-y-1">
            {profile.skills?.map(s => (
              <li key={s.name}>{s.verified ? '✓' : '!'} {s.name} · {s.level} · {s.years} yrs</li>
            ))}
          </ul>
        </Section>

        <Section icon={Award} title="Certificates">
          <ul className="text-[12px] text-txt-secondary space-y-1">
            {profile.certifications?.map(c => (
              <li key={c.id}>{c.verified ? '✓ Verified' : '… Pending'} · {c.name} ({c.issuer}, {c.year})</li>
            ))}
          </ul>
        </Section>

        <Section icon={FileText} title="Documents">
          <ul className="text-[12px] text-txt-secondary space-y-1">
            <li>{profile.aadhaarVerified ? '✓' : '!'} Aadhaar eKYC</li>
            <li>{profile.digilockerLinked ? '✓' : '!'} DigiLocker linked</li>
            <li>{profile.pccVerified ? '✓' : '!'} Police Clearance Certificate</li>
          </ul>
        </Section>

        {missing.length > 0 && (
          <AlertBanner tone="warning" title="Missing documents (still optional)" className="mt-4">
            {missing.join(' · ')} — application is still submittable but adding these speeds up recruiter review.
          </AlertBanner>
        )}
        {completeness < 60 && checklist.length > 0 && (
          <div className="mt-3 rounded-2xl border border-warn/30 bg-warn-light/60 p-3">
            <div className="text-[12px] font-bold text-warn-text mb-1">Resume readiness {completeness}% — strengthen before sending</div>
            <ul className="text-[11px] text-warn-text space-y-0.5">
              {checklist.slice(0, 4).map(c => <li key={c}>• {c}</li>)}
            </ul>
            <button onClick={() => navigate?.('resumeBuilder')} className="mt-2 text-[12px] font-bold text-primary inline-flex items-center gap-1">
              Complete resume →
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
          <div className="flex-1">
            <div className="text-[13px] font-bold text-txt-primary">Share verified profile with {job.employerName}</div>
            <p className="text-[11px] text-txt-secondary leading-relaxed mt-1">
              Includes verified Aadhaar status, NSDC skill passport, certificates and resume. You can revoke this consent later.
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={() => onSubmit(consent)}
        disabled={!consent}
        className="w-full bg-primary text-white font-bold text-[14px] py-3.5 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200 disabled:cursor-not-allowed shadow-modal"
      >
        <Send size={16} /> Submit Swift Apply
      </button>
    </>
  )
}

/* ───────────────────────── Manual application form ───────────────── */
function ManualApplyForm({ job, profile, onSubmit }) {
  const [form, setForm] = useState({
    name:           profile?.name  || '',
    phone:          profile?.phone || '',
    passport:       '',
    education:      profile?.education || '',
    workExperience: profile?.skills?.[0]?.years ? `${profile.skills[0].years} yrs ${profile.skills[0].name}` : '',
    skills:         (profile?.skills || []).map(s => s.name).join(', '),
    expectedSalary: 50000,
    consent:        false,
  })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const errors = {
    name:           !isValidName(form.name)         ? 'Use letters only. At least 2 characters.' : null,
    phone:          !isValidIndianPhone(form.phone) ? 'Enter a valid 10-digit Indian mobile.'    : null,
    passport:       form.passport.trim().length < 5  ? 'Enter your passport number.'              : null,
    education:      form.education.trim().length < 2 ? 'Pick / enter your education level.'       : null,
    workExperience: form.workExperience.trim().length < 4 ? 'Describe your work experience.'      : null,
    skills:         form.skills.trim().length < 2    ? 'List at least one skill.'                  : null,
    consent:        !form.consent                    ? 'Please accept consent to submit.'          : null,
  }
  const valid = Object.values(errors).every(e => !e)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5 space-y-3">
        <div className="text-[15px] font-extrabold text-txt-primary">Manual application</div>
        <p className="text-[11px] text-txt-secondary">Fill what's relevant — manual reviews take 24–48 hours longer than Swift Apply.</p>

        <Field label="Full name" error={errors.name}>
          <input value={form.name}     onChange={e => update('name',     e.target.value)} className={inputCls(errors.name)} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input inputMode="numeric" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputCls(errors.phone)} />
        </Field>
        <Field label="Passport number" error={errors.passport}>
          <input value={form.passport} onChange={e => update('passport', e.target.value)} className={inputCls(errors.passport)} placeholder="A1234567" />
        </Field>
        <Field label="Education" error={errors.education}>
          <input value={form.education} onChange={e => update('education', e.target.value)} className={inputCls(errors.education)} />
        </Field>
        <Field label="Work experience" error={errors.workExperience}>
          <textarea rows={3} value={form.workExperience} onChange={e => update('workExperience', e.target.value)} className={inputCls(errors.workExperience)} placeholder="Role, company, years" />
        </Field>
        <Field label="Skills (comma separated)" error={errors.skills}>
          <input value={form.skills} onChange={e => update('skills', e.target.value)} className={inputCls(errors.skills)} placeholder="Electrician, Welding" />
        </Field>
        <Field label={`Expected monthly salary: ${formatINR(form.expectedSalary)}`}>
          <input type="range" min={20000} max={200000} step={1000} value={form.expectedSalary} onChange={e => update('expectedSalary', +e.target.value)} className="w-full accent-primary" />
        </Field>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
          <div className="flex-1">
            <div className="text-[13px] font-bold text-txt-primary">Share these details with {job.employerName}</div>
            <p className="text-[11px] text-txt-secondary leading-relaxed mt-1">
              Manual submissions are not auto-verified — recruiter may ask for additional documents.
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={() => valid && onSubmit(form)}
        disabled={!valid}
        className="w-full bg-primary text-white font-bold text-[14px] py-3.5 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200 disabled:cursor-not-allowed shadow-modal"
      >
        <Send size={16} /> Submit manual application
      </button>
    </>
  )
}

/* ───────────────────────── helpers ────────────────────────── */
function profileCompleteness(profile) {
  const checks = [
    !!profile?.name, !!profile?.phone, !!profile?.location, !!profile?.education,
    !!profile?.aadhaarVerified, !!profile?.digilockerLinked,
    (profile?.skills?.length || 0) > 0,
    (profile?.certifications?.length || 0) > 0,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function resumeCompleteness(r) {
  let total = 0, done = 0
  const add = (cond) => { total++; if (cond) done++ }
  add(!!r.personal?.name)
  add(!!r.personal?.phone)
  add((r.personal?.location || '').trim().length >= 3)
  add((r.summary || '').length >= 40)
  add((r.skills || []).length > 0)
  add((r.skills || []).some(s => s.verified))
  add((r.certifications || []).length > 0)
  add((r.experience || []).length > 0)
  add((r.education || []).length > 0)
  add((r.documents || []).filter(d => d.status === 'available').length >= 3)
  return Math.round((done / total) * 100)
}

function buildResumeChecklist(r) {
  const out = []
  if ((r.summary || '').length < 40)                             out.push('Add a 40+ character summary')
  if (!(r.education || []).length)                                out.push('Add your highest qualification')
  if (!(r.experience || []).length)                               out.push('Add at least one work experience')
  if (!(r.certifications || []).length)                           out.push('Add at least one certificate')
  if (!(r.certifications || []).some(c => c.verified))            out.push('Verify a certificate via DigiLocker / NSDC')
  if (!(r.skills || []).length)                                   out.push('Add at least one skill')
  if ((r.documents || []).filter(d => d.status === 'available').length < 3)
                                                                  out.push('Mark Aadhaar / passport / contract as available')
  return out
}

function missingItems(profile) {
  const items = []
  if (!profile?.pccVerified) items.push('PCC')
  if (!profile?.skills?.every(s => s.verified)) items.push('Some unverified skills')
  if (!profile?.certifications?.every(c => c.verified)) items.push('Pending certificate verification')
  return items
}

const inputCls = (err) =>
  `w-full mt-1 border-2 rounded-xl px-3 py-3 text-[13px] outline-none bg-white ${
    err ? 'border-danger' : 'border-bdr focus:border-primary'
  }`

function formatINR(v) { return `₹${Math.round(Number(v) || 0).toLocaleString('en-IN')}` }

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-txt-secondary uppercase">{label}</label>
      {children}
      {error && <p className="text-[11px] text-danger font-medium mt-1">{error}</p>}
    </div>
  )
}
function Section({ icon: Icon, title, children }) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className="text-primary" />
        <div className="text-[12px] font-bold text-txt-primary">{title}</div>
      </div>
      {children}
    </div>
  )
}
function KV({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 text-[12px]">
      <span className="text-txt-secondary">{k}</span>
      <span className="font-semibold text-txt-primary text-right">{v || '—'}</span>
    </div>
  )
}
