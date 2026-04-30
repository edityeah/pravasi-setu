import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import Stepper from '../components/Stepper'
import AlertBanner from '../components/AlertBanner'
import StatusChip from '../components/StatusChip'
import Timeline from '../components/Timeline'
import {
  LOAN_NEED_CATEGORIES, LOAN_DOCUMENTS, LOAN_PROVIDERS,
} from '../data/mockData'
import { calculateEMI, totalPayable, totalInterest, emiAffordability, formatINR } from '../utils/financeCalculations'
import {
  Wallet, ChevronLeft, ChevronRight, ShieldCheck, Check, AlertTriangle,
  FileText, Building2, Clock, Send, Receipt, CheckCircle2,
} from 'lucide-react'

/* Loans flow — Need builder → Documents → Compare → Detail → Submit → Confirmation.
   `mode === 'list'` (default when no params) → "My Loans" view + start CTA.
   See PRAVASI_New_Features_Product_Spec.md §7. All providers are mock/prototype-safe. */

const STEP_LABELS = ['Need', 'Docs', 'Compare', 'Detail', 'Done']
const PURPOSE_HINTS = {
  travel: 'Flight + airport transfers',
  housing: 'First month rent + deposit',
  visa: 'Visa fee + medical + attestation',
  skilling: 'Pre-departure skill upgrade',
  miscellaneous: 'Reserve for unexpected costs',
}

const APPLICATION_STATUSES = {
  APPLIED:           { tone: 'info',    label: 'Applied' },
  IN_PROGRESS:       { tone: 'warning', label: 'In progress' },
  DOCUMENTS_PENDING: { tone: 'warning', label: 'Documents pending' },
  APPROVED:          { tone: 'success', label: 'Approved' },
  DISBURSAL_PENDING: { tone: 'warning', label: 'Disbursal pending' },
  COMPLETED:         { tone: 'success', label: 'Disbursed' },
  REJECTED:          { tone: 'error',   label: 'Rejected' },
}

export default function LoansPage() {
  const { loanApplications, addLoanApplication, navigate, params, profile, showToast } = useApp()
  const focusedId = params?.loanId
  const focused = focusedId ? loanApplications.find(l => l.id === focusedId) : null

  if (focused) return <LoanDetailView loan={focused} navigate={navigate} showToast={showToast} />
  if (params?.mode === 'list' || (params == null) === false && params?.mode === 'list') {
    return <MyLoansView loans={loanApplications} navigate={navigate} />
  }

  return <NewLoanWizard
    loanApplications={loanApplications}
    addLoanApplication={addLoanApplication}
    navigate={navigate}
    profile={profile}
    showToast={showToast}
  />
}

/* ───────────────────────── My Loans list view ─────────────────────────── */
function MyLoansView({ loans, navigate }) {
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="My Loans" sub={`${loans.length} application${loans.length === 1 ? '' : 's'}`} />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6">
        <div className="max-w-screen-lg mx-auto w-full space-y-3">
          {loans.length === 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-6 text-center">
              <Wallet size={36} className="text-primary mx-auto mb-2" />
              <div className="text-[14px] font-bold text-txt-primary">No loan applications yet</div>
              <p className="text-[12px] text-txt-secondary mt-1">Apply for a migration loan to fund travel, visa, housing or skilling costs.</p>
              <button
                onClick={() => navigate('loans')}
                className="mt-4 bg-primary text-white font-bold text-[13px] px-5 py-2.5 rounded-pill hover:bg-primary-dark transition-colors"
              >
                Start a new application
              </button>
            </div>
          )}
          {loans.map(l => {
            const meta = APPLICATION_STATUSES[l.status] || { tone: 'neutral', label: l.status }
            return (
              <button
                key={l.id}
                onClick={() => navigate('loans', { loanId: l.id })}
                className="w-full bg-white rounded-2xl shadow-card border border-bdr-light p-4 text-left hover:border-primary hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-txt-tertiary uppercase">{l.id}</div>
                  <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                    <Wallet size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-txt-primary truncate">{l.providerName}</div>
                    <div className="text-[11px] text-txt-secondary">EMI {formatINR(l.emi)}/mo · {l.tenureMonths} months</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-extrabold text-primary">{formatINR(l.requestedAmount)}</div>
                    <div className="text-[10px] text-txt-tertiary">applied {l.submittedOn}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Loan detail view ───────────────────────────── */
function LoanDetailView({ loan, navigate, showToast }) {
  const meta = APPLICATION_STATUSES[loan.status] || { tone: 'neutral', label: loan.status }
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title={`Loan ${loan.id}`} sub={loan.providerName} dark />

      <div className="bg-primary text-white px-5 pb-6">
        <div className="max-w-screen-lg mx-auto w-full">
          <StatusChip tone={meta.tone === 'neutral' ? 'brand' : meta.tone}>{meta.label}</StatusChip>
          <div className="text-[32px] font-extrabold mt-2 leading-tight">{formatINR(loan.requestedAmount)}</div>
          <div className="text-[12px] opacity-90">EMI {formatINR(loan.emi)}/mo for {loan.tenureMonths} months · {loan.interestRate}% p.a.</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 mt-3 space-y-3">
          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Loan terms</div>
            <Row k="Provider"          v={loan.providerName} />
            <Row k="Requested amount"  v={formatINR(loan.requestedAmount)} highlight />
            <Row k="Tenure"            v={`${loan.tenureMonths} months`} />
            <Row k="Interest rate"     v={`${loan.interestRate}% p.a.`} />
            <Row k="EMI"               v={`${formatINR(loan.emi)}/mo`} />
            <Row k="Total payable"     v={formatINR(loan.totalPayable)} />
            <Row k="Total interest"    v={formatINR(loan.totalInterest)} />
            <Row k="Relaxation period" v={`${loan.relaxationDays} days after arrival`} />
            <Row k="Processing fee"    v={`${loan.processingFeePercent}%`} />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Purpose breakdown</div>
            {loan.needs.map(n => (
              <div key={n.id} className="flex items-center justify-between py-1.5 border-b border-bdr-light last:border-0">
                <span className="text-[12px] text-txt-secondary">{n.icon} {n.label}</span>
                <span className="text-[13px] font-bold text-txt-primary">{formatINR(n.amount)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Application timeline</div>
            <Timeline items={loan.timeline || []} />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5 space-y-2">
            <button onClick={() => showToast('EMI schedule downloaded')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary">
              <Receipt size={16} className="text-primary" />
              <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Download EMI schedule</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
            <button onClick={() => showToast(`Calling ${loan.providerName}`)} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary">
              <Building2 size={16} className="text-primary" />
              <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Contact lender support</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
            <button onClick={() => navigate('grievance')} className="w-full flex items-center gap-3 p-3 rounded-card border border-danger/40 active:bg-danger-light">
              <AlertTriangle size={16} className="text-danger" />
              <div className="flex-1 text-left text-[13px] font-bold text-danger">Raise dispute</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
          </div>

          <p className="text-center text-[10px] text-txt-tertiary px-4 leading-relaxed">
            {loan.providerName} is shown as a {loan.providerTag.toLowerCase()}. Real loan products must be applied through licensed banks/NBFCs with full disclosure of APR + fees.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── New loan wizard ────────────────────────────── */
function NewLoanWizard({ loanApplications, addLoanApplication, navigate, profile, showToast }) {
  const [step, setStep] = useState(0)

  // Step 0 — needs
  const [needs, setNeeds] = useState(LOAN_NEED_CATEGORIES.map(c => ({
    ...c, selected: c.defaultAmount > 0, amount: c.defaultAmount,
  })))
  const total = needs.filter(n => n.selected).reduce((s, n) => s + Number(n.amount || 0), 0)

  // Step 1 — documents
  const [docs, setDocs] = useState(LOAN_DOCUMENTS.map(d => ({ ...d })))

  // Step 2 — provider compare
  const [providerId, setProviderId] = useState(null)
  const [tenure, setTenure] = useState(24)
  const eligibleProviders = LOAN_PROVIDERS.filter(p => total >= p.minAmount && total <= p.maxAmount)
  const selectedProvider = LOAN_PROVIDERS.find(p => p.id === providerId)

  // Derived loan terms
  const emi = useMemo(() => selectedProvider ? calculateEMI(total, selectedProvider.interestRateAnnual, tenure) : 0, [total, selectedProvider, tenure])
  const expectedSalary = profile?.preferredSalary || 50000
  const affordability  = useMemo(() => emiAffordability(emi, expectedSalary), [emi, expectedSalary])

  // Step 3 — consent
  const [consent, setConsent] = useState(false)

  const canNext = (() => {
    if (step === 0) return total > 0 && needs.some(n => n.selected)
    if (step === 1) return docs.filter(d => d.required).every(d => d.available)
    if (step === 2) return !!providerId
    if (step === 3) return consent
    return true
  })()

  const submit = () => {
    if (!selectedProvider) return
    const id = `LN-${5000 + loanApplications.length + 1}`
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const application = {
      id,
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      providerTag: selectedProvider.tag,
      requestedAmount: total,
      tenureMonths: tenure,
      interestRate: selectedProvider.interestRateAnnual,
      processingFeePercent: selectedProvider.processingFeePercent,
      relaxationDays: selectedProvider.relaxationPeriodDays,
      emi,
      totalPayable: totalPayable(total, selectedProvider.interestRateAnnual, tenure),
      totalInterest: totalInterest(total, selectedProvider.interestRateAnnual, tenure),
      needs: needs.filter(n => n.selected),
      submittedOn: today,
      status: 'IN_PROGRESS',
      timeline: [
        { step: 'Applied',                  date: today,     done: true },
        { step: 'KYC verified',             date: today,     done: true },
        { step: 'Documents under review',   date: 'In progress', done: false, current: true },
        { step: 'Approval decision',        date: 'Pending', done: false },
        { step: 'Disbursal',                date: 'Pending', done: false },
      ],
    }
    addLoanApplication(application)
    showToast(`Loan application ${id} submitted`)
    setStep(4)
    setTimeout(() => navigate('loans', { loanId: id }), 1200)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar
        title="Migration loan"
        sub={`Step ${Math.min(step + 1, 4)} of 4`}
        dark
        onBack={step > 0 && step < 4 ? () => setStep(s => s - 1) : undefined}
      />

      <div className="bg-primary px-4 pb-4">
        <div className="max-w-screen-lg mx-auto w-full">
          <Stepper steps={STEP_LABELS.slice(0, 4)} current={Math.min(step, 3)} className="text-white [&_*]:!text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 mt-3 space-y-3">
          {step === 0 && (
            <NeedBuilderStep needs={needs} setNeeds={setNeeds} total={total} />
          )}
          {step === 1 && (
            <DocsStep docs={docs} setDocs={setDocs} />
          )}
          {step === 2 && (
            <CompareStep
              providers={eligibleProviders}
              providerId={providerId}
              setProviderId={setProviderId}
              total={total}
              tenure={tenure}
              setTenure={setTenure}
              affordability={affordability}
            />
          )}
          {step === 3 && selectedProvider && (
            <ReviewStep
              provider={selectedProvider}
              total={total}
              tenure={tenure}
              emi={emi}
              consent={consent}
              setConsent={setConsent}
            />
          )}
          {step === 4 && <SubmittedStep />}
        </div>
      </div>

      {step < 4 && (
        <div className="px-4 py-3 border-t border-bdr-light bg-white flex-shrink-0">
          <div className="max-w-screen-lg mx-auto w-full flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-4 rounded-pill bg-surface-secondary text-txt-secondary font-bold text-[13px] flex items-center gap-1">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={() => canNext && setStep(s => s + 1)}
                disabled={!canNext}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight size={16} />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={submit}
                disabled={!canNext}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200 disabled:cursor-not-allowed shadow-modal"
              >
                <Send size={16} /> Submit application
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NeedBuilderStep({ needs, setNeeds, total }) {
  const update = (id, patch) => setNeeds(arr => arr.map(n => n.id === id ? { ...n, ...patch } : n))
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[15px] font-extrabold text-txt-primary">Build your loan need</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">Pick what you need funding for and how much. We use this to size the loan and pick lenders.</p>

        <div className="mt-4 space-y-2">
          {needs.map(n => (
            <div key={n.id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
              n.selected ? 'border-primary bg-primary-50' : 'border-bdr bg-white'
            }`}>
              <button
                onClick={() => update(n.id, { selected: !n.selected })}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  n.selected ? 'bg-primary border-primary' : 'border-bdr'
                }`}
              >
                {n.selected && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-txt-primary">{n.icon} {n.label}</div>
                <div className="text-[10px] text-txt-tertiary">{PURPOSE_HINTS[n.id] || ''}</div>
              </div>
              <input
                type="number"
                inputMode="numeric"
                disabled={!n.selected}
                value={n.amount || 0}
                onChange={e => update(n.id, { amount: Math.max(0, +e.target.value || 0) })}
                className="w-28 sm:w-32 text-right text-[14px] font-bold text-txt-primary border-2 border-bdr rounded-xl px-2 py-2 outline-none focus:border-primary disabled:bg-surface-secondary disabled:text-txt-tertiary"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary text-white rounded-2xl p-5 shadow-modal">
        <div className="text-[11px] uppercase font-bold opacity-80">Total requested</div>
        <div className="text-[28px] font-extrabold mt-0.5">{formatINR(total)}</div>
        <div className="text-[11px] opacity-90">Adjust amounts above — providers compare on this total.</div>
      </div>
    </>
  )
}

function DocsStep({ docs, setDocs }) {
  const toggle = (id) => setDocs(arr => arr.map(d => d.id === id ? { ...d, available: !d.available } : d))
  const allRequired = docs.filter(d => d.required).every(d => d.available)
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[15px] font-extrabold text-txt-primary">Documents</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">Lenders need these to process your migration loan.</p>
        <div className="mt-4 space-y-2">
          {docs.map(d => (
            <button key={d.id} onClick={() => toggle(d.id)} className={`w-full flex items-center gap-3 p-3 rounded-card border-2 text-left transition-colors ${
              d.available ? 'border-ok bg-ok-light' : d.required ? 'border-danger bg-danger-light' : 'border-bdr bg-white'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                d.available ? 'bg-ok text-white' : d.required ? 'bg-danger text-white' : 'bg-bdr text-txt-tertiary'
              }`}>
                {d.available ? <Check size={16} strokeWidth={3} /> : <FileText size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-txt-primary">{d.label}</div>
                <div className="text-[10px] text-txt-secondary">{d.required ? 'Required' : 'Optional'} · {d.available ? 'Ready' : 'Not yet uploaded'}</div>
              </div>
              {d.available
                ? <span className="text-[10px] font-bold text-ok">AVAILABLE</span>
                : <span className="text-[10px] font-bold text-txt-tertiary">MARK READY</span>}
            </button>
          ))}
        </div>
      </div>
      {!allRequired && (
        <AlertBanner tone="warning" title="Required documents missing">
          You can still compare providers, but mark every required doc as available before submitting an application.
        </AlertBanner>
      )}
    </>
  )
}

function CompareStep({ providers, providerId, setProviderId, total, tenure, setTenure, affordability }) {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-[15px] font-extrabold text-txt-primary">Compare lenders</div>
            <div className="text-[11px] text-txt-secondary">{providers.length} eligible for {formatINR(total)}</div>
          </div>
          <select value={tenure} onChange={e => setTenure(+e.target.value)} className="border-2 border-bdr rounded-xl px-3 py-2 text-[13px] font-bold focus:border-primary">
            {[12, 18, 24, 36].map(t => <option key={t} value={t}>{t} months</option>)}
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {providers.map(p => {
            const emi = calculateEMI(total, p.interestRateAnnual, tenure)
            const active = providerId === p.id
            return (
              <button
                key={p.id}
                onClick={() => setProviderId(p.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                  active ? 'border-primary bg-primary-50' : 'border-bdr bg-white hover:border-primary'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[14px] font-bold text-txt-primary">{p.name}</div>
                    <div className="text-[10px] text-txt-secondary">{p.type} · {p.tag}</div>
                  </div>
                  {p.badge && <span className="px-1.5 py-0.5 rounded-pill bg-primary-50 text-primary text-[9px] font-bold">{p.badge}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                  <KV k="Interest" v={`${p.interestRateAnnual}%`} />
                  <KV k="EMI"      v={`${formatINR(emi)}/mo`} highlight />
                  <KV k="Tenure"   v={`${tenure} months`} />
                  <KV k="Relaxation" v={`${p.relaxationPeriodDays} days`} />
                  <KV k="Processing fee" v={`${p.processingFeePercent}%`} />
                  <KV k="Decision" v={p.processingTime} />
                </div>
                {active && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-primary font-bold">
                    <CheckCircle2 size={14} /> Selected
                  </div>
                )}
              </button>
            )
          })}
          {providers.length === 0 && (
            <AlertBanner tone="info" title="No lenders match yet">
              Adjust your loan amount in step 1 — most lenders need a minimum of ₹10,000 and cap at ₹3,00,000.
            </AlertBanner>
          )}
        </div>
      </div>

      {providerId && affordability && (
        <AlertBanner
          tone={affordability.ok ? 'success' : affordability.level === 'high' ? 'error' : 'warning'}
          title={affordability.ok ? 'EMI looks affordable' : 'Check affordability'}
        >
          {affordability.message}
        </AlertBanner>
      )}
    </>
  )
}

function ReviewStep({ provider, total, tenure, emi, consent, setConsent }) {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[15px] font-extrabold text-txt-primary">Review your application</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">Confirm before sharing your verified profile with the lender.</p>

        <div className="mt-4 space-y-1">
          <Row k="Provider"          v={`${provider.name} (${provider.tag})`} />
          <Row k="Requested amount"  v={formatINR(total)} highlight />
          <Row k="Tenure"            v={`${tenure} months`} />
          <Row k="Interest rate"     v={`${provider.interestRateAnnual}% p.a.`} />
          <Row k="EMI"               v={`${formatINR(emi)}/mo`} />
          <Row k="Total payable"     v={formatINR(totalPayable(total, provider.interestRateAnnual, tenure))} />
          <Row k="Relaxation period" v={`${provider.relaxationPeriodDays} days after arrival`} />
          <Row k="Processing fee"    v={`${provider.processingFeePercent}%`} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
          <div className="flex-1">
            <div className="text-[13px] font-bold text-txt-primary">Share verified profile with this lender</div>
            <p className="text-[11px] text-txt-secondary leading-relaxed mt-1">
              Aadhaar KYC, passport, NSDC skill passport, job offer/contract, and migration checklist.
              You can revoke this consent later. Lender will not see your bank statements unless you upload them.
            </p>
          </div>
        </label>
      </div>

      <AlertBanner tone="info" title="Prototype-safe loan flow">
        Real loan products must disclose APR, fees and run regulated KYC under RBI/NBFC guidance. This prototype only simulates the journey.
      </AlertBanner>
    </>
  )
}

function SubmittedStep() {
  return (
    <div className="bg-white rounded-2xl shadow-modal border border-bdr-light p-8 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-ok-light flex items-center justify-center animate-pop">
        <div className="w-12 h-12 rounded-full bg-ok flex items-center justify-center">
          <CheckCircle2 size={26} className="text-white" strokeWidth={3} />
        </div>
      </div>
      <div className="text-[18px] font-extrabold text-txt-primary mt-3">Application submitted</div>
      <p className="text-[12px] text-txt-secondary mt-1">Opening your loan tracker…</p>
    </div>
  )
}

/* ───────────────────────── shared bits ────────────────────────────────── */

function Row({ k, v, highlight }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-2 border-b border-bdr-light last:border-0 ${highlight ? 'bg-primary-50 -mx-2 px-2 rounded-lg border-0' : ''}`}>
      <span className="text-[12px] text-txt-secondary">{k}</span>
      <span className={`text-[13px] font-bold text-right ${highlight ? 'text-primary' : 'text-txt-primary'}`}>{v}</span>
    </div>
  )
}

function KV({ k, v, highlight }) {
  return (
    <div className={`rounded-lg p-2 ${highlight ? 'bg-primary-50' : 'bg-surface-secondary'}`}>
      <div className="text-[9px] uppercase font-bold text-txt-tertiary">{k}</div>
      <div className={`text-[12px] font-bold ${highlight ? 'text-primary' : 'text-txt-primary'}`}>{v}</div>
    </div>
  )
}
