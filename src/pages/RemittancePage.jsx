import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import Stepper from '../components/Stepper'
import AlertBanner from '../components/AlertBanner'
import PartnerStrip from '../components/PartnerStrip'
import {
  RECIPIENTS, PAYOUT_METHODS, FUNDING_METHODS, REMITTANCE_PROVIDERS,
  SOURCE_COUNTRIES, TRANSFER_PURPOSES,
  AFFILIATED_PAYOUT_BANKS, CASH_PICKUP_AGENTS,
} from '../data/mockData'
import {
  ArrowDownUp, Send, Clock, ShieldCheck, ChevronRight, CheckCircle2, Lock,
  Building2, Smartphone, MapPin, BadgeCheck, BellRing, Share2, Download,
  AlertTriangle, ChevronLeft, Plus, User as UserIcon, Receipt, Bookmark,
  HelpCircle, X,
} from 'lucide-react'

/* SwiftChat-aligned multi-step inward remittance flow.
   Spec: india_remittance_feature_research.md
     1 Quote → 2 Method → 3 Recipient → 4 KYC → 5 Funding → 6 Review → 7 Confirmation
   Trust copy + status enum + exception states are taken from §15 / §12.3 / §14. */

const STEP_LABELS = ['Quote', 'Method', 'Recipient', 'KYC', 'Pay', 'Review', 'Done']

const PAYOUT_ICON = { UPI: Smartphone, BANK: Building2, CASH: MapPin }

export default function RemittancePage() {
  const { showToast, navigate, addTransfer, transfers, profile } = useApp()
  const [step, setStep] = useState(0)
  const [showHelp, setShowHelp] = useState(false)

  // ── Quote
  const [sourceCode, setSourceCode] = useState('AE')
  const sourceCountry = SOURCE_COUNTRIES.find(c => c.code === sourceCode)
  const [sourceAmount, setSourceAmount] = useState(500)
  const [providerId, setProviderId] = useState('wise')
  const provider = REMITTANCE_PROVIDERS.find(p => p.id === providerId) || REMITTANCE_PROVIDERS[0]
  const fxRate = provider.rate || sourceCountry.rate
  const fee = provider.fee
  const receiveAmount = Math.max(0, Math.round(sourceAmount * fxRate - fee))

  // ── Method
  const [payout, setPayout] = useState('UPI')

  // ── Recipient
  const [recipientId, setRecipientId] = useState(RECIPIENTS[0].id)
  const recipient = RECIPIENTS.find(r => r.id === recipientId) || RECIPIENTS[0]
  const [purpose, setPurpose] = useState(TRANSFER_PURPOSES[0])

  // dynamic recipient form fields (UPI, bank, cash) — prefilled from saved record but editable
  const recipientMethod = recipient.methods.find(m => m.type === payout) || recipient.methods[0]
  const [upiId, setUpiId] = useState(recipientMethod?.upiId || '')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountConfirm, setAccountConfirm] = useState('')
  const [ifsc, setIfsc] = useState(recipientMethod?.ifsc || '')
  const [pickupCity, setPickupCity] = useState(recipientMethod?.city || 'Lucknow')

  // ── Funding
  const [fundingId, setFundingId] = useState('debit_card')
  const funding = FUNDING_METHODS.find(f => f.id === fundingId)

  // ── Confirmation
  const [confirmedTransferId, setConfirmedTransferId] = useState(null)

  // ── Validation helpers
  const upiValid = /^[a-z0-9._-]{3,}@[a-z]{2,}$/i.test(upiId)
  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())
  const accountValid = accountNumber.length >= 6 && accountNumber === accountConfirm

  const canAdvance = (() => {
    if (step === 0) return sourceAmount > 0
    if (step === 1) return !!payout
    if (step === 2) {
      if (payout === 'UPI')  return upiValid
      if (payout === 'BANK') return accountValid && ifscValid
      if (payout === 'CASH') return !!pickupCity
    }
    if (step === 3) return true // KYC simulated as already verified
    if (step === 4) return !!fundingId
    if (step === 5) return true
    return false
  })()

  // ── Submit
  const submit = () => {
    const id = `TR-${10000 + transfers.length + 1}`
    const now = new Date()
    const fmt = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })

    let toLabel = recipient.fullName
    if (payout === 'UPI')  toLabel += ` · UPI ${upiId}`
    if (payout === 'BANK') toLabel += ` · ${ifsc.toUpperCase()} XXXX${accountNumber.slice(-4)}`
    if (payout === 'CASH') toLabel += ` · Cash pickup ${pickupCity}`

    addTransfer({
      id,
      from: `You (${sourceCountry.name})`,
      to: toLabel,
      sourceCurrency: sourceCountry.currency,
      sourceAmount,
      fxRate,
      fee,
      receiveCurrency: 'INR',
      amount: receiveAmount,
      provider: provider.name,
      payoutMethod: payout,
      fundingMethod: funding.label,
      purpose,
      initiatedOn: fmt,
      eta: payout === 'UPI' ? 'In minutes' : payout === 'BANK' ? 'Same day' : 'Ready today',
      status: 'PROCESSING',
      statusLabel: 'Processing',
      timeline: [
        { step: 'Created',                  date: fmt, done: true },
        { step: 'Payment received',         date: fmt, done: true },
        { step: 'Compliance review',        date: fmt, done: true, current: true },
        { step: 'Sent to payout partner',   date: 'Pending', done: false },
        { step: payout === 'UPI' ? 'UPI processing' : payout === 'BANK' ? 'Bank processing' : 'Ready for pickup', date: 'Pending', done: false },
        { step: payout === 'CASH' ? 'Picked up' : 'Delivered', date: 'Pending', done: false },
      ],
    })
    setConfirmedTransferId(id)
    setStep(6)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar
        title="Send money to India"
        sub={confirmedTransferId ? `Transfer ${confirmedTransferId}` : `Step ${Math.min(step + 1, 6)} of 6`}
        dark
        onBack={step > 0 && step < 6 ? () => setStep(s => s - 1) : undefined}
        actions={[{ icon: <HelpCircle size={18} />, onClick: () => setShowHelp(true), label: 'How to send' }]}
      />

      {/* Stepper — full-width blue band, content capped to xl. */}
      <div className="bg-primary px-4 pb-4">
        <div className="max-w-screen-xl mx-auto w-full">
          <Stepper steps={STEP_LABELS.slice(0, 6)} current={Math.min(step, 5)} className="text-white [&_*]:!text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-screen-xl mx-auto w-full lg:grid lg:grid-cols-3 lg:gap-4 lg:p-4">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-2">
            {step === 0 && <QuoteStep
              sourceCountry={sourceCountry} setSourceCode={setSourceCode}
              sourceAmount={sourceAmount} setSourceAmount={setSourceAmount}
              fxRate={fxRate} fee={fee} receiveAmount={receiveAmount}
              providerId={providerId} setProviderId={setProviderId}
            />}
            {step === 1 && <MethodStep payout={payout} setPayout={setPayout} sourceAmount={sourceAmount} fxRate={fxRate} />}
            {step === 2 && <RecipientStep
              recipient={recipient} setRecipientId={setRecipientId} payout={payout}
              upiId={upiId} setUpiId={setUpiId} upiValid={upiValid}
              accountNumber={accountNumber} setAccountNumber={setAccountNumber}
              accountConfirm={accountConfirm} setAccountConfirm={setAccountConfirm}
              ifsc={ifsc} setIfsc={setIfsc} ifscValid={ifscValid}
              pickupCity={pickupCity} setPickupCity={setPickupCity}
              purpose={purpose} setPurpose={setPurpose}
            />}
            {step === 3 && <KYCStep profile={profile} sourceAmount={sourceAmount} />}
            {step === 4 && <FundingStep fundingId={fundingId} setFundingId={setFundingId} />}
            {step === 5 && <ReviewStep
              sourceCountry={sourceCountry} sourceAmount={sourceAmount}
              fxRate={fxRate} fee={fee} receiveAmount={receiveAmount}
              provider={provider} payout={payout} recipient={recipient}
              upiId={upiId} accountNumber={accountNumber} ifsc={ifsc} pickupCity={pickupCity}
              funding={funding} purpose={purpose}
            />}
            {step === 6 && confirmedTransferId && (
              <ConfirmationStep
                id={confirmedTransferId}
                navigate={navigate}
                onAgain={() => { setStep(0); setConfirmedTransferId(null) }}
                showToast={showToast}
                payout={payout}
              />
            )}
          </div>

          {/* Sticky summary side panel — visible from quote onward */}
          <div className="lg:col-span-1 mt-2 lg:mt-0">
            <div className="lg:sticky lg:top-4 space-y-2">
              <Summary
                sourceCountry={sourceCountry} sourceAmount={sourceAmount}
                fxRate={fxRate} fee={fee} receiveAmount={receiveAmount}
                provider={provider} payout={payout}
              />
              {step >= 1 && (
                <div className="bg-white rounded-card shadow-card p-4 mx-4 lg:mx-0">
                  <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2">Trust & safety</div>
                  <div className="space-y-1 text-[11px] text-txt-secondary">
                    <div className="flex items-center gap-2"><Lock size={12} className="text-primary" /> Encrypted, audited transfer ID</div>
                    <div className="flex items-center gap-2"><BadgeCheck size={12} className="text-primary" /> {provider.name} — {provider.tag}</div>
                    <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-primary" /> RBI-style KYC + AML simulated</div>
                  </div>
                </div>
              )}
              <PartnerStrip className="mx-4 lg:mx-0" />
            </div>
          </div>
        </div>
      </div>

      {showHelp && <HowToSendDrawer onClose={() => setShowHelp(false)} />}

      {/* Footer actions */}
      {step < 6 && (
        <div className="px-4 py-3 border-t border-bdr-light bg-white flex-shrink-0">
          <div className="max-w-screen-xl mx-auto w-full flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-4 rounded-pill bg-surface-secondary text-txt-secondary font-bold text-[13px] flex items-center gap-1">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step < 5 && (
              <button
                onClick={() => canAdvance && setStep(s => s + 1)}
                disabled={!canAdvance}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight size={16} />
              </button>
            )}
            {step === 5 && (
              <button onClick={submit} className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 shadow-modal">
                <Send size={16} /> Confirm & send ₹{receiveAmount.toLocaleString()}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── STEPS ───────────────────────── */

function QuoteStep({ sourceCountry, setSourceCode, sourceAmount, setSourceAmount, fxRate, fee, receiveAmount, providerId, setProviderId }) {
  return (
    <>
      <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
        <div className="text-[15px] font-extrabold text-txt-primary">Get a quote</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">Know the exact amount your family receives before you pay.</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] font-bold text-txt-secondary uppercase">From</span>
            <select
              value={sourceCountry.code}
              onChange={e => setSourceCode(e.target.value)}
              className="w-full mt-1 border-2 border-bdr rounded-xl px-2 py-3 text-[13px] bg-white outline-none focus:border-primary"
            >
              {SOURCE_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-txt-secondary uppercase">To</span>
            <div className="w-full mt-1 border-2 border-bdr rounded-xl px-2 py-3 text-[13px] bg-surface-secondary text-txt-primary">
              🇮🇳 India
            </div>
          </label>
        </div>

        <div className="mt-3 bg-white border border-bdr rounded-card p-3">
          <div className="text-[10px] text-txt-secondary font-semibold uppercase mb-2">You send</div>
          <div className="flex items-center gap-2 border-b border-bdr pb-3">
            <span className="text-[18px]">{sourceCountry.flag}</span>
            <input
              type="number" inputMode="decimal" min={1}
              value={sourceAmount}
              onChange={e => setSourceAmount(Math.max(0, +e.target.value || 0))}
              className="flex-1 text-[24px] font-extrabold text-txt-primary outline-none"
            />
            <span className="text-[13px] font-bold text-txt-secondary">{sourceCountry.currency}</span>
          </div>

          <div className="flex justify-center -my-3 z-10 relative">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-modal">
              <ArrowDownUp size={16} className="text-white" />
            </div>
          </div>

          <div className="text-[10px] text-txt-secondary font-semibold uppercase mb-2 mt-1">Recipient gets</div>
          <div className="flex items-center gap-2 pt-3">
            <span className="text-[18px]">🇮🇳</span>
            <div className="flex-1 text-[24px] font-extrabold text-primary">₹{receiveAmount.toLocaleString()}</div>
            <span className="text-[13px] font-bold text-txt-secondary">INR</span>
          </div>
          <div className="text-[10px] text-txt-tertiary mt-1 flex flex-wrap gap-x-3">
            <span>Rate: 1 {sourceCountry.currency} = ₹{fxRate}</span>
            <span>· Fee: ₹{fee}</span>
            <span>· Rate locked for 5 min</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
        <div className="text-[13px] font-bold text-txt-primary mb-2 flex items-center justify-between">
          <span>Compare providers</span>
          <span className="text-[10px] text-ok font-bold">Best rate first</span>
        </div>
        <div className="space-y-2">
          {REMITTANCE_PROVIDERS.slice().sort((a, b) => b.rate - a.rate).map(p => (
            <button
              key={p.id}
              onClick={() => setProviderId(p.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-card border-2 text-left ${
                providerId === p.id ? 'border-primary bg-primary-50' : 'border-bdr bg-white'
              }`}
            >
              <span className="text-[22px]">{p.logo}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <div className="text-[13px] font-bold text-txt-primary truncate">{p.name}</div>
                  {p.best && <span className="px-1.5 py-0.5 rounded-pill bg-ok-light text-ok text-[9px] font-bold">BEST</span>}
                </div>
                <div className="text-[10px] text-txt-tertiary flex flex-wrap gap-x-2">
                  <span>₹{p.rate}</span><span>· Fee ₹{p.fee}</span>
                  <span className="flex items-center gap-0.5"><Clock size={9} /> {p.time}</span>
                  <span className="text-info">· {p.tag}</span>
                </div>
              </div>
              <div className="text-right text-[13px] font-extrabold text-txt-primary">
                ₹{Math.max(0, Math.round(800 * p.rate - p.fee)).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function MethodStep({ payout, setPayout, sourceAmount, fxRate }) {
  return (
    <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
      <div className="text-[15px] font-extrabold text-txt-primary">Choose delivery method</div>
      <p className="text-[11px] text-txt-secondary mt-0.5">Different methods have different speed and fees.</p>

      <div className="mt-4 space-y-2">
        {PAYOUT_METHODS.map(m => {
          const Icon = PAYOUT_ICON[m.id]
          const active = payout === m.id
          const youGet = Math.round(sourceAmount * fxRate * (1 - m.feePct / 100))
          return (
            <button
              key={m.id}
              onClick={() => setPayout(m.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-card border-2 text-left ${
                active ? 'border-primary bg-primary-50' : 'border-bdr bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary text-white' : 'bg-primary-light text-primary'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-bold text-txt-primary">{m.label}</div>
                  <span className="text-[10px] text-txt-secondary">{m.eta}</span>
                </div>
                <p className="text-[11px] text-txt-secondary mt-0.5">{m.description}</p>
                <div className="text-[11px] text-txt-tertiary mt-1">Estimated recipient gets ≈ ₹{youGet.toLocaleString()}</div>
              </div>
              {active && <CheckCircle2 size={18} className="text-primary mt-1" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RecipientStep(props) {
  const { recipient, setRecipientId, payout,
    upiId, setUpiId, upiValid,
    accountNumber, setAccountNumber, accountConfirm, setAccountConfirm,
    ifsc, setIfsc, ifscValid,
    pickupCity, setPickupCity,
    purpose, setPurpose } = props

  return (
    <>
      <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
        <div className="text-[15px] font-extrabold text-txt-primary">Send to</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">Saved recipients · or add a new one.</p>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 mt-3">
          {RECIPIENTS.map(r => {
            const active = recipient.id === r.id
            return (
              <button
                key={r.id}
                onClick={() => setRecipientId(r.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 w-20 p-2 rounded-card border-2 ${
                  active ? 'border-primary bg-primary-50' : 'border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-pill ${r.avatarColor} text-white text-[16px] font-bold flex items-center justify-center`}>
                  {r.initials}
                </div>
                <span className="text-[10px] font-semibold text-txt-primary truncate w-full text-center">{r.fullName.split(' ')[0]}</span>
                <span className="text-[9px] text-txt-tertiary">{r.relationship}</span>
              </button>
            )
          })}
          <button className="flex-shrink-0 flex flex-col items-center gap-1 w-20">
            <div className="w-12 h-12 rounded-pill bg-primary-light text-primary flex items-center justify-center border-2 border-dashed border-primary">
              <Plus size={18} />
            </div>
            <span className="text-[10px] font-semibold text-primary">Add new</span>
          </button>
        </div>

        <AlertBanner tone="warning" title="Confirm the recipient details carefully" className="mt-3">
          Incorrect bank, UPI, or cash pickup details may delay the transfer or require a refund.
        </AlertBanner>
      </div>

      {/* Dynamic form per payout method */}
      <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
        <div className="text-[13px] font-bold text-txt-primary mb-3">
          {payout === 'UPI'  && 'UPI ID details'}
          {payout === 'BANK' && 'Bank account details'}
          {payout === 'CASH' && 'Cash pickup details'}
        </div>

        {payout === 'UPI' && (
          <>
            <Field label="Recipient UPI ID">
              <input
                value={upiId} onChange={e => setUpiId(e.target.value.trim())}
                placeholder="name@bank"
                className="w-full border-2 border-bdr rounded-xl px-3 py-3 text-[14px] outline-none focus:border-primary"
              />
              <p className={`text-[11px] mt-1 ${upiValid ? 'text-ok' : 'text-txt-tertiary'}`}>
                {upiValid ? `✓ Verified — ${recipient.fullName.toUpperCase()}` : 'Format: name@bank · We confirm the recipient name before sending'}
              </p>
            </Field>
            <Field label="Relationship">
              <div className="text-[14px] font-semibold text-txt-primary">{recipient.relationship}</div>
            </Field>
          </>
        )}

        {payout === 'BANK' && (
          <>
            <Field label="Affiliated Indian banks">
              <div className="flex gap-1.5 flex-wrap mt-1">
                {AFFILIATED_PAYOUT_BANKS.map(b => (
                  <a
                    key={b.id}
                    href={b.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-pill bg-primary-50 text-primary text-[11px] font-bold border border-primary/20 hover:bg-primary-100"
                    title={b.name}
                  >
                    {b.name}{b.supportsInstant ? ' ⚡' : ''}
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-txt-tertiary mt-1">⚡ supports instant credit. We confirm the recipient name with the bank before transferring.</p>
            </Field>
            <Field label="Full name (as per bank)">
              <div className="text-[14px] font-semibold text-txt-primary">{recipient.fullName}</div>
            </Field>
            <Field label="Account number">
              <input
                inputMode="numeric"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full border-2 border-bdr rounded-xl px-3 py-3 text-[14px] outline-none focus:border-primary"
              />
            </Field>
            <Field label="Confirm account number">
              <input
                inputMode="numeric"
                value={accountConfirm}
                onChange={e => setAccountConfirm(e.target.value.replace(/\D/g, ''))}
                className="w-full border-2 border-bdr rounded-xl px-3 py-3 text-[14px] outline-none focus:border-primary"
              />
              {accountNumber && accountConfirm && accountNumber !== accountConfirm && (
                <p className="text-[11px] text-danger mt-1">Account numbers don't match</p>
              )}
            </Field>
            <Field label="IFSC code">
              <input
                value={ifsc}
                onChange={e => setIfsc(e.target.value.toUpperCase())}
                placeholder="SBIN0001234"
                className="w-full border-2 border-bdr rounded-xl px-3 py-3 text-[14px] outline-none focus:border-primary uppercase"
              />
              <p className={`text-[11px] mt-1 ${ifscValid ? 'text-ok' : 'text-txt-tertiary'}`}>
                {ifscValid ? `✓ Branch: ${recipient.methods.find(m => m.type === 'BANK')?.branch || 'Lucknow Main'}` : '11 chars · format AAAA0XXXXXX'}
              </p>
            </Field>
          </>
        )}

        {payout === 'CASH' && (
          <>
            <Field label="Receiver legal name">
              <div className="text-[14px] font-semibold text-txt-primary">{recipient.fullName}</div>
            </Field>
            <Field label="Pickup city">
              <input
                value={pickupCity}
                onChange={e => setPickupCity(e.target.value)}
                className="w-full border-2 border-bdr rounded-xl px-3 py-3 text-[14px] outline-none focus:border-primary"
              />
            </Field>
            <Field label="Pickup partner">
              <div className="space-y-2">
                {CASH_PICKUP_AGENTS.filter(a => !pickupCity || a.city.toLowerCase().includes(pickupCity.toLowerCase().slice(0, 4))).slice(0, 4).map(a => (
                  <div key={a.id} className="rounded-card border border-bdr p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-txt-primary truncate">{a.name}</div>
                        <div className="text-[11px] text-txt-secondary">{a.address} · {a.city}</div>
                        <div className="text-[10px] text-txt-tertiary">📞 {a.contact} · {a.hours}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-txt-tertiary mt-1">Receiver carries: {a.documents.join(' + ')}</div>
                  </div>
                ))}
                {CASH_PICKUP_AGENTS.filter(a => !pickupCity || a.city.toLowerCase().includes(pickupCity.toLowerCase().slice(0, 4))).length === 0 && (
                  <div className="rounded-card border border-warn bg-warn-light p-3 text-[11px] text-warn-text">
                    No partner agents in {pickupCity}. Try a nearby major city.
                  </div>
                )}
              </div>
            </Field>
            <p className="text-[11px] text-txt-secondary mt-1">Receiver must carry a valid government ID and the pickup code we send by SMS.</p>
          </>
        )}

        <Field label="Purpose of transfer">
          <select
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            className="w-full border-2 border-bdr rounded-xl px-3 py-3 text-[14px] outline-none focus:border-primary bg-white"
          >
            {TRANSFER_PURPOSES.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>
    </>
  )
}

function KYCStep({ profile, sourceAmount }) {
  return (
    <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
      <div className="text-[15px] font-extrabold text-txt-primary">Sender verification</div>
      <p className="text-[11px] text-txt-secondary mt-0.5">
        We need to verify your identity to keep transfers secure and comply with financial regulations. This usually takes a few minutes.
      </p>

      <div className="mt-4 p-4 rounded-card bg-ok-light flex items-start gap-3">
        <div className="w-10 h-10 rounded-pill bg-ok text-white flex items-center justify-center">
          <ShieldCheck size={18} />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold text-ok">KYC already verified</div>
          <div className="text-[11px] text-txt-secondary">Aadhaar eKYC + DigiLocker — completed during onboarding.</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <KV k="Name (legal)"  v={profile.name} />
        <KV k="Date of birth" v="14-Jul-1997" />
        <KV k="Address"       v={profile.location} />
        <KV k="Occupation"    v="Skilled worker — Electrician" />
        {sourceAmount * 22 > 200000 && (
          <KV k="Source of funds" v="Salary · Al Habtoor Construction · UAE" />
        )}
      </div>

      <AlertBanner tone="info" title="High-value transfers" className="mt-4">
        Transfers above an equivalent of ₹2,00,000/month may need source-of-funds review per RBI MTSS / RDA guidance.
      </AlertBanner>
    </div>
  )
}

function FundingStep({ fundingId, setFundingId }) {
  return (
    <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
      <div className="text-[15px] font-extrabold text-txt-primary">How will you pay?</div>
      <p className="text-[11px] text-txt-secondary mt-0.5">Compare funding methods by speed and cost.</p>

      <div className="mt-4 space-y-2">
        {FUNDING_METHODS.map(f => {
          const active = fundingId === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFundingId(f.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-card border-2 text-left ${
                active ? 'border-primary bg-primary-50' : 'border-bdr bg-white'
              }`}
            >
              <span className="text-[20px] w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">{f.icon}</span>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-txt-primary">{f.label}</div>
                <div className="text-[10px] text-txt-secondary">{f.eta} · {f.feeNote}</div>
              </div>
              {active && <CheckCircle2 size={18} className="text-primary" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReviewStep({ sourceCountry, sourceAmount, fxRate, fee, receiveAmount, provider, payout, recipient, upiId, accountNumber, ifsc, pickupCity, funding, purpose }) {
  let to = recipient.fullName
  if (payout === 'UPI')  to += ` · ${upiId}`
  if (payout === 'BANK') to += ` · ${ifsc.toUpperCase()} XXXX${accountNumber.slice(-4)}`
  if (payout === 'CASH') to += ` · Cash pickup ${pickupCity}`

  return (
    <>
      <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
        <div className="text-[15px] font-extrabold text-txt-primary">Review your transfer</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">One last check before we send the money.</p>

        <div className="mt-4 space-y-1">
          <KV k="You send"        v={`${sourceAmount.toLocaleString()} ${sourceCountry.currency}`} />
          <KV k="Transfer fee"    v={`${fee} ${sourceCountry.currency}`} />
          <KV k="Exchange rate"   v={`1 ${sourceCountry.currency} = ₹${fxRate}`} />
          <KV k="Recipient gets"  v={`₹${receiveAmount.toLocaleString()}`} highlight />
          <KV k="Delivery method" v={`${payout} via ${provider.name}`} />
          <KV k="Recipient"       v={to} />
          <KV k="Purpose"         v={purpose} />
          <KV k="Funding"         v={funding.label} />
          <KV k="Estimated delivery" v={payout === 'UPI' ? 'In minutes' : payout === 'BANK' ? 'Same day' : 'Ready today'} />
        </div>
      </div>

      <AlertBanner tone="warning" title="Avoid scam transfers">
        Only send money to people you know and trust. Do not send money for jobs, lottery winnings, visa promises, crypto investments, or unknown callers.
      </AlertBanner>

      <AlertBanner tone="info" title="Refund policy">
        Refund is available if the transfer is not paid out or credited. Refunds typically reach you within 3–5 business days.
      </AlertBanner>
    </>
  )
}

function ConfirmationStep({ id, navigate, onAgain, showToast, payout }) {
  return (
    <>
      <div className="bg-white p-6 lg:rounded-card lg:shadow-card text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-ok-light flex items-center justify-center animate-pop">
          <div className="w-12 h-12 rounded-full bg-ok flex items-center justify-center">
            <CheckCircle2 size={26} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="text-[18px] font-extrabold text-txt-primary mt-3">Your transfer is on its way</div>
        <p className="text-[12px] text-txt-secondary mt-1 max-w-[300px] mx-auto leading-relaxed">
          We'll notify you and your recipient when the money is delivered. Track progress in real-time below.
        </p>

        <div className="mt-4 inline-block bg-primary-50 text-primary text-[12px] font-bold px-3 py-1.5 rounded-pill">
          Transfer ID · {id}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('transferTracker', { transferId: id })}
            className="bg-primary text-white font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2"
          >
            <Receipt size={14} /> Track transfer
          </button>
          <button onClick={() => showToast('Receipt PDF downloaded')} className="bg-white border-2 border-primary text-primary font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2">
            <Download size={14} /> Download receipt
          </button>
          <button onClick={() => showToast('Receipt shared via WhatsApp')} className="bg-white border-2 border-bdr text-txt-primary font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2">
            <Share2 size={14} /> Share receipt
          </button>
          <button onClick={() => showToast('Recipient saved')} className="bg-white border-2 border-bdr text-txt-primary font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2">
            <Bookmark size={14} /> Save recipient
          </button>
          <button onClick={() => showToast('Notification sent to recipient')} className="bg-white border-2 border-bdr text-txt-primary font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2">
            <BellRing size={14} /> Notify receiver
          </button>
          <button onClick={onAgain} className="bg-white border-2 border-bdr text-txt-primary font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2">
            <Send size={14} /> Send again
          </button>
        </div>
      </div>

      <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
        <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Set a rate alert</div>
        <p className="text-[11px] text-txt-secondary mb-3">Get notified when the rate beats your target — useful for monthly remittances.</p>
        <button onClick={() => showToast('Rate alert added · 1 AED ≥ ₹23.10')} className="w-full bg-primary-light text-primary font-bold text-[13px] py-2.5 rounded-pill flex items-center justify-center gap-2">
          <BellRing size={14} /> Notify me at 1 AED ≥ ₹23.10
        </button>
      </div>
    </>
  )
}

/* ───────────────────────── shared bits ───────────────────────── */

function Summary({ sourceCountry, sourceAmount, fxRate, fee, receiveAmount, provider, payout }) {
  return (
    <div className="bg-primary text-white px-5 py-4 lg:rounded-card shadow-modal">
      <div className="text-[10px] uppercase font-bold opacity-80">Quote summary</div>
      <div className="text-[28px] font-extrabold leading-tight mt-0.5">₹{receiveAmount.toLocaleString()}</div>
      <div className="text-[12px] opacity-90">recipient gets</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <Pill label="You send" value={`${sourceAmount.toLocaleString()} ${sourceCountry.currency}`} />
        <Pill label="Fee"      value={`${fee} ${sourceCountry.currency}`} />
        <Pill label="FX rate"  value={`₹${fxRate}`} />
        <Pill label="Method"   value={payout || '—'} />
      </div>
      <div className="text-[10px] opacity-80 mt-2">via {provider.name} · {provider.tag}</div>
    </div>
  )
}

function Pill({ label, value }) {
  return (
    <div className="bg-white/15 rounded-xl p-2">
      <div className="text-[9px] uppercase opacity-80">{label}</div>
      <div className="text-[12px] font-bold">{value}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <span className="block text-[11px] font-semibold text-txt-secondary uppercase tracking-wide mb-1">{label}</span>
      {children}
    </div>
  )
}

function KV({ k, v, highlight }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-2 border-b border-bdr-light last:border-0 ${highlight ? 'bg-primary-50 -mx-2 px-2 rounded-lg border-0' : ''}`}>
      <span className="text-[12px] text-txt-secondary">{k}</span>
      <span className={`text-[13px] font-bold text-right ${highlight ? 'text-primary' : 'text-txt-primary'}`}>{v}</span>
    </div>
  )
}

function HowToSendDrawer({ onClose }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-[560px] rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-in"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[18px] font-extrabold text-txt-primary">How to send money home</div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"><X size={18} /></button>
        </div>
        <ol className="space-y-3 text-[12px] text-txt-secondary leading-relaxed list-decimal pl-5">
          <li><b className="text-txt-primary">Compare provider rate and fee.</b> The provider with the highest "recipient gets" usually wins — but check settlement time too.</li>
          <li><b className="text-txt-primary">Add recipient details.</b> UPI ID for fastest, bank account+IFSC for traceable, or cash pickup for unbanked family.</li>
          <li><b className="text-txt-primary">Verify your identity.</b> Aadhaar eKYC or DigiLocker — already done if you finished onboarding.</li>
          <li><b className="text-txt-primary">Pay from card, bank transfer, wallet or agent.</b> Each method has a different cutoff time.</li>
          <li><b className="text-txt-primary">Track until delivered.</b> Open My Transfers any time to see status, share receipt, or call provider support.</li>
        </ol>

        <div className="mt-4 p-3 rounded-xl bg-warn-light text-warn-text text-[11px]">
          <b>Avoid scams.</b> Only send to people you know. Do not send money for jobs, lottery winnings, visa promises, crypto investments, or unknown callers.
        </div>
        <div className="mt-2 p-3 rounded-xl bg-info-light text-info text-[11px]">
          <b>Fee + FX disclosure.</b> Every provider tag (Prototype partner / Mock regulated partner / Integration-ready) is mock for the prototype. Real transfers must use a licensed MTSS / RDA / NPCI partner under RBI guidance.
        </div>
        <div className="mt-2 p-3 rounded-xl bg-danger-light text-danger text-[11px]">
          <b>Confirm recipient details carefully.</b> Wrong UPI / IFSC / bank account may delay the transfer or require a refund.
        </div>
      </div>
    </div>
  )
}
