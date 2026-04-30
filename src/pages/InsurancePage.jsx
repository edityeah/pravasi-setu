import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import Stepper from '../components/Stepper'
import StatusChip from '../components/StatusChip'
import AlertBanner from '../components/AlertBanner'
import Timeline from '../components/Timeline'
import { INSURANCE_CATEGORIES, INSURANCE_PROVIDERS, INSURANCE_PLANS } from '../data/mockData'
import { formatINR } from '../utils/financeCalculations'
import {
  Shield, ShieldCheck, FileBadge, Phone, MessageCircle, AlertTriangle,
  ChevronLeft, ChevronRight, CheckCircle2, Send, Download, Share2, Building2,
} from 'lucide-react'

/* Insurance flow — Marketplace (categories + tabs for Claims/Complaint/Talk-to-someone)
   → Plans → Detail → Pay → Tracker. params.policyId opens detail of an existing
   policy, params.mode='list' opens My Insurance.
   See PRAVASI_New_Features_Product_Spec.md §8. All insurers are mock partners. */

const STEP_LABELS = ['Pick plan', 'Detail', 'Pay', 'Done']
const POLICY_STATUSES = {
  PAYMENT_PENDING: { tone: 'warning', label: 'Payment pending' },
  ACTIVE:          { tone: 'success', label: 'Active' },
  ISSUED:          { tone: 'success', label: 'Document issued' },
  CLAIM_OPEN:      { tone: 'warning', label: 'Claim raised' },
  EXPIRED:         { tone: 'neutral', label: 'Expired' },
  REJECTED:        { tone: 'error',   label: 'Rejected' },
}

export default function InsurancePage() {
  const { insurancePolicies, addInsurancePolicy, updateInsurancePolicy, navigate, params, showToast } = useApp()
  const focused = params?.policyId ? insurancePolicies.find(p => p.id === params.policyId) : null

  if (focused) return <PolicyDetail policy={focused} update={updateInsurancePolicy} navigate={navigate} showToast={showToast} />
  if (params?.mode === 'list') return <MyInsuranceView policies={insurancePolicies} navigate={navigate} />

  return <InsuranceMarketplace
    policies={insurancePolicies}
    addInsurancePolicy={addInsurancePolicy}
    initialCategory={params?.category}
    navigate={navigate}
    showToast={showToast}
  />
}

/* ───────────────────────── My Insurance ────────────────────────────── */
function MyInsuranceView({ policies, navigate }) {
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="My Insurance" sub={`${policies.length} polic${policies.length === 1 ? 'y' : 'ies'}`} />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6">
        <div className="max-w-screen-lg mx-auto w-full space-y-3">
          {policies.length === 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-6 text-center">
              <Shield size={36} className="text-primary mx-auto mb-2" />
              <div className="text-[14px] font-bold text-txt-primary">No insurance policies yet</div>
              <p className="text-[12px] text-txt-secondary mt-1">Browse the insurance marketplace to find PBBY, travel, health and family cover.</p>
              <button onClick={() => navigate('insurance')} className="mt-4 bg-primary text-white font-bold text-[13px] px-5 py-2.5 rounded-pill hover:bg-primary-dark transition-colors">
                Browse insurance
              </button>
            </div>
          )}
          {policies.map(p => {
            const meta = POLICY_STATUSES[p.status] || { tone: 'neutral', label: p.status }
            return (
              <button key={p.id} onClick={() => navigate('insurance', { policyId: p.id })}
                className="w-full bg-white rounded-2xl shadow-card border border-bdr-light p-4 text-left hover:border-primary hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-txt-tertiary uppercase">{p.id}</div>
                  <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-[18px]">{p.categoryIcon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-txt-primary truncate">{p.planName}</div>
                    <div className="text-[11px] text-txt-secondary truncate">{p.providerName} · cover {formatINR(p.coverageAmount)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-extrabold text-primary">{formatINR(p.premium)}</div>
                    <div className="text-[10px] text-txt-tertiary">{p.frequency}</div>
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

/* ───────────────────────── Marketplace + wizard ─────────────────────── */
function InsuranceMarketplace({ policies, addInsurancePolicy, initialCategory, navigate, showToast }) {
  const [tab, setTab] = useState('insurance') // insurance | claims | complaint | support
  const [category, setCategory] = useState(initialCategory || null)
  const [planId, setPlanId] = useState(null)
  const [step, setStep] = useState(0) // 0 marketplace, 1 detail, 2 pay, 3 done
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [consent, setConsent] = useState(false)

  const plans = useMemo(() => {
    if (!category) return []
    return INSURANCE_PLANS.filter(p => p.category === category).map(p => ({
      ...p,
      provider: INSURANCE_PROVIDERS.find(pp => pp.id === p.providerId),
    }))
  }, [category])

  const plan = INSURANCE_PLANS.find(p => p.id === planId)
  const provider = plan ? INSURANCE_PROVIDERS.find(pp => pp.id === plan.providerId) : null

  const submit = () => {
    if (!plan || !provider) return
    const id = `POL-${7000 + policies.length + 1}`
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    addInsurancePolicy({
      id,
      planId: plan.id,
      planName: plan.name,
      category: plan.category,
      categoryIcon: INSURANCE_CATEGORIES.find(c => c.id === plan.category)?.icon || '🛡️',
      providerId: provider.id,
      providerName: provider.name,
      providerTag: provider.tag,
      premium: plan.premium,
      frequency: plan.frequency,
      coverageAmount: plan.coverageAmount,
      benefits: plan.benefits,
      paymentMethod,
      policyNumber: `${provider.id.toUpperCase().slice(0,4)}-${Math.floor(Math.random() * 9_000_000) + 1_000_000}`,
      issuedOn: today,
      status: 'ACTIVE',
      timeline: [
        { step: 'Submitted',         date: today, done: true },
        { step: 'Payment received',  date: today, done: true },
        { step: 'Underwriting check',date: today, done: true },
        { step: 'Policy issued',     date: today, done: true, current: true },
      ],
    })
    showToast(`Policy ${id} issued`)
    setStep(3)
    setTimeout(() => navigate('insurance', { policyId: id }), 1200)
  }

  // Wizard step gate
  const canNext = step === 1 ? !!planId : step === 2 ? consent && !!paymentMethod : true

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar
        title="Insurance"
        sub={category ? `${INSURANCE_CATEGORIES.find(c => c.id === category)?.label || ''}` : 'Marketplace'}
        dark
        onBack={step > 0 ? () => setStep(s => s - 1) : undefined}
      />

      {/* Tabs */}
      {step === 0 && (
        <div className="bg-primary px-4 pb-3">
          <div className="max-w-screen-xl mx-auto w-full flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'insurance', label: 'Insurance' },
              { id: 'claims',    label: 'Claims' },
              { id: 'complaint', label: 'File complaint' },
              { id: 'support',   label: 'Talk to someone' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-[12px] font-bold ${
                  tab === t.id ? 'bg-white text-primary' : 'bg-white/15 text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step > 0 && (
        <div className="bg-primary px-4 pb-4">
          <div className="max-w-screen-lg mx-auto w-full">
            <Stepper steps={STEP_LABELS} current={step} className="text-white [&_*]:!text-white" />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 mt-3 space-y-3">
          {step === 0 && tab === 'insurance' && (
            <>
              {!category && (
                <div className="space-y-3">
                  <AlertBanner tone="info" title="PBBY may be mandatory for ECR-category workers">
                    Pravasi Bharatiya Bima Yojana — government-mandated cover for emigrant workers. Confirm eligibility with your recruiting agent.
                  </AlertBanner>

                  <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
                    <div className="text-[15px] font-extrabold text-txt-primary">Pick a category</div>
                    <p className="text-[11px] text-txt-secondary mt-0.5">Insurance plans grouped by what they protect.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mt-4">
                      {INSURANCE_CATEGORIES.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setCategory(c.id)}
                          className="text-left bg-white border border-bdr-light hover:border-primary hover:-translate-y-0.5 rounded-2xl p-4 transition-all shadow-card"
                        >
                          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-[22px]">{c.icon}</div>
                          <div className="text-[13px] font-bold text-txt-primary mt-3">{c.label}</div>
                          <p className="text-[10px] text-txt-secondary mt-1 leading-relaxed line-clamp-3">{c.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
                    <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Providers</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {INSURANCE_PROVIDERS.map(p => (
                        <div key={p.id} className="rounded-xl border border-bdr-light p-3">
                          <div className="text-[12px] font-bold text-txt-primary truncate">{p.name}</div>
                          <div className="text-[10px] text-txt-secondary">{p.type}</div>
                          <div className="text-[9px] text-info font-bold mt-1">{p.tag}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {category && (
                <div className="space-y-3">
                  <button onClick={() => setCategory(null)} className="text-[12px] font-bold text-primary inline-flex items-center gap-1">
                    <ChevronLeft size={14} /> All categories
                  </button>

                  <div className="grid gap-3 md:grid-cols-2">
                    {plans.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setPlanId(p.id); setStep(1) }}
                        className="text-left bg-white rounded-2xl shadow-card border border-bdr-light p-4 hover:border-primary hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-txt-primary">{p.name}</div>
                            <div className="text-[10px] text-txt-secondary">{p.provider?.name} · {p.provider?.tag}</div>
                          </div>
                          {p.badge && <span className="px-1.5 py-0.5 rounded-pill bg-primary-50 text-primary text-[9px] font-bold">{p.badge}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                          <KV k="Premium"  v={`${formatINR(p.premium)} / ${p.frequency.replace('-', ' ')}`} highlight />
                          <KV k="Coverage" v={formatINR(p.coverageAmount)} />
                        </div>
                        <ul className="mt-3 text-[11px] text-txt-secondary space-y-0.5 line-clamp-3">
                          {p.benefits.slice(0, 3).map(b => <li key={b}>• {b}</li>)}
                        </ul>
                      </button>
                    ))}
                    {plans.length === 0 && (
                      <AlertBanner tone="info" title="No plans yet">
                        We're adding more plans for this category. Check back later or pick another type above.
                      </AlertBanner>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 0 && tab === 'claims' && (
            <ClaimsView policies={policies} navigate={navigate} showToast={showToast} />
          )}
          {step === 0 && tab === 'complaint' && (
            <ComplaintView navigate={navigate} showToast={showToast} />
          )}
          {step === 0 && tab === 'support' && (
            <SupportView showToast={showToast} navigate={navigate} />
          )}

          {step === 1 && plan && provider && (
            <PlanDetailStep plan={plan} provider={provider} />
          )}
          {step === 2 && plan && provider && (
            <PaymentStep
              plan={plan}
              provider={provider}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              consent={consent}
              setConsent={setConsent}
            />
          )}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-modal border border-bdr-light p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-ok-light flex items-center justify-center animate-pop">
                <div className="w-12 h-12 rounded-full bg-ok flex items-center justify-center">
                  <CheckCircle2 size={26} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="text-[18px] font-extrabold text-txt-primary mt-3">Policy issued</div>
              <p className="text-[12px] text-txt-secondary mt-1">Opening your policy…</p>
            </div>
          )}
        </div>
      </div>

      {step >= 1 && step < 3 && (
        <div className="px-4 py-3 border-t border-bdr-light bg-white flex-shrink-0">
          <div className="max-w-screen-lg mx-auto w-full flex gap-2">
            <button onClick={() => setStep(s => s - 1)} className="px-4 rounded-pill bg-surface-secondary text-txt-secondary font-bold text-[13px] flex items-center gap-1">
              <ChevronLeft size={14} /> Back
            </button>
            {step === 1 && (
              <button onClick={() => canNext && setStep(2)} disabled={!canNext}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200">
                Get insurance <ChevronRight size={16} />
              </button>
            )}
            {step === 2 && (
              <button onClick={submit} disabled={!canNext}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200 shadow-modal">
                <Send size={16} /> Pay {formatINR(plan?.premium || 0)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PlanDetailStep({ plan, provider }) {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[15px] font-extrabold text-txt-primary">{plan.name}</div>
        <div className="text-[12px] text-txt-secondary">{provider.name} · {provider.tag}</div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <KV k="Premium"  v={`${formatINR(plan.premium)} / ${plan.frequency.replace('-', ' ')}`} highlight />
          <KV k="Coverage" v={formatINR(plan.coverageAmount)} />
        </div>
        <Section title="Benefits">
          <ul className="text-[12px] text-txt-secondary space-y-1">
            {plan.benefits.map(b => <li key={b}>✓ {b}</li>)}
          </ul>
        </Section>
        <Section title="Exclusions">
          <ul className="text-[12px] text-txt-secondary space-y-1">
            {plan.exclusions.map(e => <li key={e}>– {e}</li>)}
          </ul>
        </Section>
        <Section title="Documents required">
          <ul className="text-[12px] text-txt-secondary space-y-1">
            {plan.documents.map(d => <li key={d}>• {d}</li>)}
          </ul>
        </Section>
        <Section title="Claim support">
          <div className="text-[12px] text-txt-secondary">Helpline: <span className="font-bold text-primary">{provider.claimHelpline}</span></div>
        </Section>
      </div>
    </>
  )
}

function PaymentStep({ plan, provider, paymentMethod, setPaymentMethod, consent, setConsent }) {
  const opts = [
    { id: 'UPI',          label: 'UPI',           note: 'Instant',   icon: '📲' },
    { id: 'NET_BANKING',  label: 'Net banking',    note: '1–2 hours', icon: '🏦' },
    { id: 'BANK_BRANCH',  label: 'Bank branch',    note: 'Walk-in',   icon: '🏛️' },
  ].filter(o => plan.paymentMethods.includes(o.id))
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[15px] font-extrabold text-txt-primary">Pay premium</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">{provider.name} accepts these methods.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          {opts.map(o => {
            const active = paymentMethod === o.id
            return (
              <button key={o.id} onClick={() => setPaymentMethod(o.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                  active ? 'border-primary bg-primary-50' : 'border-bdr bg-white hover:border-primary'
                }`}>
                <div className="text-[22px]">{o.icon}</div>
                <div className="text-[13px] font-bold text-txt-primary mt-1">{o.label}</div>
                <div className="text-[10px] text-txt-secondary">{o.note}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <Row k="Plan"     v={plan.name} />
        <Row k="Provider" v={provider.name} />
        <Row k="Premium"  v={formatINR(plan.premium)} highlight />
        <Row k="Method"   v={paymentMethod.replace('_', ' ').toLowerCase()} />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
          <div className="flex-1">
            <div className="text-[13px] font-bold text-txt-primary">Share verified KYC with {provider.name}</div>
            <p className="text-[11px] text-txt-secondary leading-relaxed mt-1">
              Aadhaar KYC, passport status, and contact details — used only to issue this policy.
            </p>
          </div>
        </label>
      </div>

      <AlertBanner tone="info" title="Prototype-safe payment">
        This prototype simulates the policy issuance. Real premiums must flow through licensed insurers/banks under IRDAI guidance.
      </AlertBanner>
    </>
  )
}

/* ───────────────────────── Policy detail ─────────────────────────────── */
function PolicyDetail({ policy, update, navigate, showToast }) {
  const meta = POLICY_STATUSES[policy.status] || { tone: 'neutral', label: policy.status }
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar
        title={`Policy ${policy.id}`}
        sub={policy.providerName}
        dark
        actions={[
          { icon: <Share2 size={18} />,   onClick: () => showToast('Policy shared via WhatsApp') },
          { icon: <Download size={18} />, onClick: () => showToast('Policy PDF downloaded') },
        ]}
      />

      <div className="bg-primary text-white px-5 pb-6">
        <div className="max-w-screen-lg mx-auto w-full">
          <StatusChip tone={meta.tone === 'neutral' ? 'brand' : meta.tone}>{meta.label}</StatusChip>
          <div className="text-[24px] font-extrabold mt-2 leading-tight">{policy.planName}</div>
          <div className="text-[12px] opacity-90">Cover {formatINR(policy.coverageAmount)} · Policy no. {policy.policyNumber}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 mt-3 space-y-3">
          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <Row k="Premium paid"  v={`${formatINR(policy.premium)} / ${policy.frequency.replace('-', ' ')}`} />
            <Row k="Issued on"     v={policy.issuedOn} />
            <Row k="Payment method" v={policy.paymentMethod} />
            <Row k="Provider"      v={`${policy.providerName} (${policy.providerTag})`} />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Timeline</div>
            <Timeline items={policy.timeline || []} />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5 space-y-2">
            <button onClick={() => showToast('Policy PDF downloaded')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary">
              <FileBadge size={16} className="text-primary" />
              <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Download policy PDF</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
            <button
              onClick={() => { update(policy.id, { status: 'CLAIM_OPEN' }); showToast('Claim started — case officer will call within 24 hr') }}
              className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary"
            >
              <ShieldCheck size={16} className="text-primary" />
              <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">File a claim</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
            <button onClick={() => navigate('grievance')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary">
              <AlertTriangle size={16} className="text-warn-text" />
              <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">File a complaint</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Tabs (claims / complaint / support) ──────── */
function ClaimsView({ policies, navigate, showToast }) {
  const claimable = policies.filter(p => p.status !== 'EXPIRED')
  return (
    <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
      <div className="text-[15px] font-extrabold text-txt-primary">Raise a claim</div>
      <p className="text-[11px] text-txt-secondary mt-0.5">Pick the active policy you'd like to claim against.</p>
      <div className="mt-4 space-y-2">
        {claimable.length === 0 && <p className="text-[12px] text-txt-secondary">No active policies yet.</p>}
        {claimable.map(p => (
          <button key={p.id} onClick={() => navigate('insurance', { policyId: p.id })}
            className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary text-left">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-[18px]">{p.categoryIcon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-txt-primary truncate">{p.planName}</div>
              <div className="text-[11px] text-txt-secondary">{p.providerName}</div>
            </div>
            <ChevronRight size={14} className="text-txt-tertiary" />
          </button>
        ))}
      </div>
    </div>
  )
}

function ComplaintView({ navigate, showToast }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
      <div className="text-[15px] font-extrabold text-txt-primary">File a complaint</div>
      <p className="text-[11px] text-txt-secondary mt-0.5">
        Use the grievance system to escalate to MEA, embassy or our legal team. Insurance complaints are tracked alongside other grievances.
      </p>
      <button onClick={() => navigate('grievance')} className="mt-4 bg-primary text-white font-bold text-[13px] px-5 py-2.5 rounded-pill hover:bg-primary-dark transition-colors">
        Open grievance form
      </button>
    </div>
  )
}

function SupportView({ showToast, navigate }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
      <div className="text-[15px] font-extrabold text-txt-primary">Talk to someone</div>
      <p className="text-[11px] text-txt-secondary mt-0.5">Pick a channel — multilingual support available.</p>
      <div className="mt-4 space-y-2">
        <button onClick={() => navigate('chat')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary">
          <MessageCircle size={16} className="text-primary" />
          <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Setu Assistant chat</div>
          <ChevronRight size={14} className="text-txt-tertiary" />
        </button>
        <button onClick={() => showToast('Calling +91 1800-PRAVASI')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary">
          <Phone size={16} className="text-primary" />
          <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Call +91 1800-PRAVASI (Mon–Sat 9 AM – 8 PM)</div>
          <ChevronRight size={14} className="text-txt-tertiary" />
        </button>
        <button onClick={() => navigate('emergency')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary">
          <Building2 size={16} className="text-primary" />
          <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Embassy / consulate hotline</div>
          <ChevronRight size={14} className="text-txt-tertiary" />
        </button>
      </div>
    </div>
  )
}

/* ───────────────────────── shared bits ──────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="mt-4">
      <div className="text-[10px] font-bold text-txt-secondary uppercase tracking-wide mb-1">{title}</div>
      {children}
    </div>
  )
}
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
