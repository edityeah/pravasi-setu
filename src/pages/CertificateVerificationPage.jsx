import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { VerifiedBadge } from '../components/VerifiedBadge'
import { CERTIFICATES } from '../data/mockData'
import PartnerStrip from '../components/PartnerStrip'
import {
  Award, Building2, Calendar, FileBadge, Hash, ShieldCheck, Download, Share2, ChevronRight, Clock
} from 'lucide-react'

export default function CertificateVerificationPage() {
  const { params, navigate, showToast } = useApp()
  const cert = CERTIFICATES.find(c => c.id === params.certId) || CERTIFICATES[0]

  const isVerified = cert.verified
  const accent = isVerified ? 'ok' : 'warn'

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar
        title="Certificate verification"
        sub={cert.issuer}
        actions={[
          { icon: <Share2 size={18} />, onClick: () => showToast('Verification link copied') },
          { icon: <Download size={18} />, onClick: () => showToast('Certificate PDF downloaded') },
        ]}
      />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Hero status */}
        <div className={`bg-${accent} text-white px-5 pt-5 pb-6`}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Award size={26} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold opacity-80 uppercase">{cert.verificationStatus}</div>
              <div className="text-[18px] font-extrabold leading-tight mt-0.5">{cert.name}</div>
              <div className="text-[12px] opacity-90 mt-0.5">{cert.issuer} · {cert.year}</div>
            </div>
          </div>

          {isVerified && (
            <div className="mt-4 bg-white text-txt-primary rounded-card p-3 flex items-center gap-3 shadow-modal">
              <div className="w-10 h-10 rounded-full bg-ok flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-bold">Verified by {cert.verifierAuthority}</div>
                <div className="text-[10px] text-txt-secondary">on {cert.verifiedOn}</div>
              </div>
              <VerifiedBadge label="On-chain" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white mt-2 p-5">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Details</div>
          <Detail icon={Building2} label="Issuer"            value={cert.issuer} />
          <Detail icon={Hash}      label="Certificate no."   value={cert.certNumber} />
          <Detail icon={Calendar}  label="Issue year"        value={cert.year} />
          <Detail icon={Calendar}  label="Valid till"        value={cert.expiry} />
          <Detail icon={FileBadge} label="DigiLocker linked" value={cert.digilockerLinked ? 'Yes' : 'No'} />
          <Detail icon={ShieldCheck} label="Skills covered"  value={cert.skills.join(', ')} />
        </div>

        {/* Blockchain proof */}
        {isVerified && cert.blockchainHash && (
          <div className="bg-white mt-2 p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Blockchain proof</div>
            <div className="rounded-xl border-2 border-dashed border-ok bg-ok-light p-3">
              <div className="text-[10px] text-ok font-bold uppercase">SHA-256 hash</div>
              <div className="font-mono text-[12px] text-txt-primary mt-1 break-all">{cert.blockchainHash}</div>
              <button onClick={() => showToast('Verifier opened')} className="mt-2 text-[11px] font-bold text-primary">
                Verify on Setu Chain →
              </button>
            </div>
          </div>
        )}

        {/* Pending timeline */}
        {!isVerified && cert.timeline && (
          <div className="bg-white mt-2 p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Verification progress</div>
            <ol className="relative ml-2 border-l-2 border-bdr space-y-3">
              {cert.timeline.map((t, i) => (
                <li key={i} className="ml-4">
                  <span className={`absolute -left-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
                    t.done ? 'bg-ok' : t.current ? 'bg-warn' : 'bg-bdr'
                  }`}>
                    {t.done ? <ShieldCheck size={10} className="text-white" /> : t.current ? <Clock size={10} className="text-white" /> : null}
                  </span>
                  <div className="text-[12px] font-bold text-txt-primary">{t.step}</div>
                  <div className="text-[10px] text-txt-secondary">{t.date}</div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Trust note */}
        <div className="mx-4 mt-3 p-3 rounded-xl bg-info-light flex items-start gap-2">
          <ShieldCheck size={14} className="text-info mt-0.5" />
          <p className="text-[11px] text-info leading-relaxed">
            Verified certificates can be shared with employers via your Skill Passport QR — no manual checks needed.
          </p>
        </div>

        <PartnerStrip className="mx-4 mt-3" />
      </div>

      <div className="px-4 py-3 border-t border-bdr-light bg-white flex gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('passport')}
          className="flex-1 bg-surface-secondary text-txt-primary font-bold text-[13px] py-3 rounded-pill"
        >
          Back to Passport
        </button>
        {!isVerified ? (
          <button
            onClick={() => showToast('Verification re-requested from issuer')}
            className="flex-1 bg-primary text-white font-bold text-[13px] py-3 rounded-pill"
          >
            Re-request verification
          </button>
        ) : (
          <button
            onClick={() => showToast('Shared via WhatsApp')}
            className="flex-1 bg-primary text-white font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2"
          >
            Share with employer <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-bdr-light last:border-0">
      <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-txt-secondary uppercase">{label}</div>
        <div className="text-[13px] font-semibold text-txt-primary truncate">{String(value)}</div>
      </div>
    </div>
  )
}
