import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { VerifiedBadge, FlaggedBadge } from '../components/VerifiedBadge'
import { EMPLOYERS, JOBS, EMPLOYER_REVIEWS } from '../data/mockData'
import {
  Building2, Star, MapPin, Briefcase, ShieldCheck, AlertTriangle, ChevronRight, BadgeCheck, Share2
} from 'lucide-react'

export default function EmployerProfilePage() {
  const { params, navigate, showToast } = useApp()
  const employer = EMPLOYERS.find(e => e.id === params.employerId) || EMPLOYERS[0]
  const jobs = JOBS.filter(j => j.employerId === employer.id)

  const compliance = [
    { k: 'salaryOnTime',         label: 'Salary paid on time'      },
    { k: 'contractTransparent',  label: 'Contract transparency'    },
    { k: 'accommodationStandard',label: 'Accommodation standards'  },
    { k: 'safetyCertified',      label: 'Safety certified'         },
  ]

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar
        title="Employer Profile"
        actions={[{ icon: <Share2 size={18} />, onClick: () => showToast('Profile link copied') }]}
      />

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Header */}
        <div className="bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <Building2 size={26} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-[18px] font-extrabold text-txt-primary leading-tight">{employer.name}</div>
              <div className="text-[12px] text-txt-secondary mt-0.5">{employer.sector} · {employer.country}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {employer.flagged ? <FlaggedBadge /> : employer.verified ? <VerifiedBadge label="Verified Employer" /> : <VerifiedBadge verified={false} />}
                <span className="text-[10px] text-txt-tertiary">{employer.yearsActive} yrs active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-bdr-light">
            <Stat label="Trust score"  value={`${employer.trustScore}★`} />
            <Stat label="Reviews"       value={employer.reviews} />
            <Stat label="Open jobs"     value={employer.openJobs} />
          </div>
        </div>

        {/* About */}
        <div className="bg-white mt-2 p-5">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2">About</div>
          <p className="text-[12px] text-txt-secondary leading-relaxed">{employer.description}</p>
        </div>

        {/* Compliance */}
        <div className="bg-white mt-2 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-ok" />
            <div className="text-[13px] font-bold text-txt-primary">Compliance & worker safety</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {compliance.map(c => {
              const ok = employer.compliance?.[c.k]
              return (
                <div key={c.k} className={`p-3 rounded-xl border ${ok ? 'border-ok bg-ok-light' : 'border-warn bg-warn-light'}`}>
                  <div className={`text-[11px] font-bold ${ok ? 'text-ok' : 'text-warn'}`}>
                    {ok ? '✓ ' : '⚠ '}{c.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white mt-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-bold text-txt-primary">Worker reviews</div>
            <button onClick={() => navigate('rateEmployer', { employerId: employer.id })} className="text-[11px] font-bold text-primary">
              + Rate
            </button>
          </div>
          <div className="space-y-3">
            {EMPLOYER_REVIEWS.map((r, i) => (
              <div key={i} className="border-b border-bdr-light pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-bold text-txt-primary">{r.name}</div>
                  {r.verified && <VerifiedBadge verified label="Verified worker" />}
                </div>
                <div className="flex items-center gap-0.5 my-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={10} className={i <= r.rating ? 'text-warn fill-warn' : 'text-bdr'} />
                  ))}
                  <span className="text-[10px] text-txt-tertiary ml-1">{r.date}</span>
                </div>
                <p className="text-[11px] text-txt-secondary leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open jobs */}
        <div className="px-4 mt-4">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2">Open positions ({jobs.length})</div>
          <div className="space-y-2">
            {jobs.slice(0, 6).map(j => (
              <button
                key={j.id}
                onClick={() => navigate('jobDetail', { jobId: j.id })}
                className="w-full bg-white rounded-card shadow-card p-3 text-left flex items-center gap-3 active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
                  <Briefcase size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-txt-primary truncate">{j.title}</div>
                  <div className="text-[10px] text-txt-secondary truncate flex items-center gap-1">
                    <MapPin size={10} /> {j.destinationCity} · {j.contractDuration}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-primary">₹{j.salaryMin.toLocaleString()}+</div>
                  <ChevronRight size={14} className="text-txt-tertiary inline" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report */}
        <button
          onClick={() => navigate('grievance')}
          className="mx-4 mt-4 w-[calc(100%-32px)] flex items-center gap-3 p-3 rounded-card bg-danger-light border border-danger"
        >
          <AlertTriangle size={16} className="text-danger" />
          <div className="flex-1 text-left">
            <div className="text-[12px] font-bold text-danger">Report this employer</div>
            <div className="text-[10px] text-txt-secondary">Routes to Embassy + Pravasi Setu legal team</div>
          </div>
          <ChevronRight size={14} className="text-danger" />
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[18px] font-extrabold text-txt-primary leading-tight">{value}</div>
      <div className="text-[10px] text-txt-secondary uppercase">{label}</div>
    </div>
  )
}
