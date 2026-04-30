import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import Timeline from '../components/Timeline'
import AlertBanner from '../components/AlertBanner'
import StatusChip from '../components/StatusChip'
import {
  Send, Check, Clock, ArrowDownToLine, Building2, ChevronRight, Phone, Receipt,
  Download, Share2, AlertTriangle, RefreshCw, BellRing,
} from 'lucide-react'

// status → tone for chip + alert banner
const STATUS_TONE = {
  CREATED:           { tone: 'info',    label: 'Created' },
  PAYMENT_PENDING:   { tone: 'warning', label: 'Payment pending' },
  PAYMENT_RECEIVED:  { tone: 'info',    label: 'Payment received' },
  KYC_REQUIRED:      { tone: 'warning', label: 'KYC required' },
  COMPLIANCE_REVIEW: { tone: 'warning', label: 'Compliance review' },
  PROCESSING:        { tone: 'warning', label: 'Processing' },
  SENT_TO_PARTNER:   { tone: 'info',    label: 'Sent to partner' },
  UPI_PROCESSING:    { tone: 'info',    label: 'UPI processing' },
  BANK_PROCESSING:   { tone: 'info',    label: 'Bank processing' },
  READY_FOR_PICKUP:  { tone: 'warning', label: 'Ready for pickup' },
  DELIVERED:         { tone: 'success', label: 'Delivered' },
  PICKED_UP:         { tone: 'success', label: 'Picked up' },
  FAILED:            { tone: 'error',   label: 'Failed' },
  CANCELLED:         { tone: 'neutral', label: 'Cancelled' },
  REFUND_INITIATED:  { tone: 'warning', label: 'Refund initiated' },
  REFUNDED:          { tone: 'success', label: 'Refunded' },
}

export default function TransferTrackerPage() {
  const { transfers, params, navigate, showToast } = useApp()
  const focusId = params?.transferId
  const focused = focusId ? transfers.find(t => t.id === focusId) : null

  if (focused) return <Detail t={focused} navigate={navigate} showToast={showToast} />

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="Transfer tracker" sub={`${transfers.length} transfers`} />

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-6">
        <div className="max-w-screen-md mx-auto w-full space-y-3">
          {transfers.map(t => {
            const meta = STATUS_TONE[t.status] || { tone: 'neutral', label: t.status }
            return (
              <button
                key={t.id}
                onClick={() => navigate('transferTracker', { transferId: t.id })}
                className="w-full bg-white rounded-card shadow-card p-4 text-left active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-txt-tertiary uppercase">{t.id}</div>
                  <StatusChip tone={meta.tone}>{t.statusLabel || meta.label}</StatusChip>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
                    <Send size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-txt-primary truncate">{t.to}</div>
                    <div className="text-[11px] text-txt-secondary truncate">
                      {t.provider} · {t.payoutMethod} · {t.initiatedOn}
                    </div>
                  </div>
                  <div className="text-[14px] font-extrabold text-primary">₹{t.amount.toLocaleString()}</div>
                </div>
                <div className="mt-3 grid grid-cols-6 gap-1">
                  {(t.timeline || []).map((s, i) => (
                    <div key={i}
                      className={`h-1 rounded-full ${
                        s.exception ? 'bg-danger' :
                        s.done      ? 'bg-primary' :
                        s.current   ? 'bg-warn' : 'bg-bdr-light'
                      }`}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Detail({ t, navigate, showToast }) {
  const meta = STATUS_TONE[t.status] || { tone: 'neutral', label: t.status }
  const isException = ['FAILED', 'CANCELLED', 'REFUND_INITIATED', 'REFUNDED', 'KYC_REQUIRED'].includes(t.status)

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title={`Transfer ${t.id}`} sub={t.provider} dark />

      <div className="bg-primary text-white px-5 pb-6 pt-2">
        <StatusChip tone={meta.tone === 'neutral' ? 'brand' : meta.tone}>{t.statusLabel || meta.label}</StatusChip>
        <div className="text-[32px] font-extrabold mt-2 leading-tight">₹{t.amount.toLocaleString()}</div>
        <div className="text-[12px] opacity-90">to {t.to}</div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-screen-md mx-auto w-full">
          {isException && t.exception && (
            <AlertBanner tone="error" title={t.exception} className="mx-4 mt-3">
              We've started the resolution. Refunds typically reach you in 3–5 business days. Tap Raise dispute below if you need to escalate.
            </AlertBanner>
          )}

          <div className="bg-white p-5 mt-2">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Transfer details</div>
            <Row k="From"           v={t.from} />
            <Row k="You sent"       v={`${t.sourceAmount} ${t.sourceCurrency}`} />
            <Row k="FX rate"        v={`1 ${t.sourceCurrency} = ₹${t.fxRate}`} />
            <Row k="Fee"            v={`${t.fee} ${t.sourceCurrency}`} />
            <Row k="Recipient gets" v={`₹${t.amount.toLocaleString()}`} highlight />
            <Row k="Provider"       v={`${t.provider}`} />
            <Row k="Payout"         v={t.payoutMethod} />
            <Row k="Funding"        v={t.fundingMethod} />
            <Row k="Purpose"        v={t.purpose} />
            <Row k="Initiated"      v={t.initiatedOn} />
            <Row k="ETA"            v={t.eta} />
          </div>

          <div className="bg-white mt-2 p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Status timeline</div>
            <Timeline items={t.timeline || []} />
          </div>

          <div className="bg-white mt-2 p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Quick actions</div>
            <Action icon={Receipt}    label="View receipt"           onClick={() => showToast('Receipt opened')} />
            <Action icon={Download}   label="Download PDF"            onClick={() => showToast('Receipt PDF downloaded')} />
            <Action icon={Share2}     label="Share with recipient"    onClick={() => showToast('Receipt shared via WhatsApp')} />
            <Action icon={BellRing}   label="Notify recipient by SMS" onClick={() => showToast('SMS sent to recipient')} />
            <Action icon={Phone}      label={`Call ${t.provider} support`} onClick={() => showToast(`Calling ${t.provider}…`)} />
            <Action icon={RefreshCw}  label="Send again to this recipient" onClick={() => navigate('remittance')} />
            <Action icon={AlertTriangle} label="Raise dispute / get help"   onClick={() => navigate('grievance')} danger />
          </div>

          <p className="px-4 mt-3 text-[10px] text-txt-tertiary text-center leading-relaxed">
            {t.provider} is shown as a prototype/mock partner. Real transfers must use a regulated MTSS / RDA / NPCI inward-remittance partner per RBI guidance.
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({ k, v, highlight }) {
  return (
    <div className={`flex items-start justify-between text-[12px] gap-2 py-2 border-b border-bdr-light last:border-0 ${highlight ? 'bg-primary-50 -mx-2 px-2 rounded-lg border-0' : ''}`}>
      <span className="text-txt-secondary">{k}</span>
      <span className={`font-semibold text-right ${highlight ? 'text-primary' : 'text-txt-primary'}`}>{v}</span>
    </div>
  )
}

function Action({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-surface-secondary mb-2 ${danger ? 'border-danger/40' : ''}`}
    >
      <Icon size={16} className={danger ? 'text-danger' : 'text-primary'} />
      <div className={`flex-1 text-left text-[13px] font-bold ${danger ? 'text-danger' : 'text-txt-primary'}`}>{label}</div>
      <ChevronRight size={14} className="text-txt-tertiary" />
    </button>
  )
}
