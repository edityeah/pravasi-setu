import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { VerifiedBadge, FlaggedBadge } from '../components/VerifiedBadge'
import { JOBS, EMPLOYER_REVIEWS } from '../data/mockData'
import {
  Building2, MapPin, Star, Clock, Users, Plane, Bookmark, Share2, ShieldCheck,
  AlertTriangle, ChevronRight, Wrench, GraduationCap, Languages, BadgeIndianRupee, Calendar
} from 'lucide-react'

export default function JobDetailPage() {
  const { params, navigate, showToast } = useApp()
  const job = JOBS.find(j => j.id === params.jobId) || JOBS[0]

  // Apply Now hands off to JobApplyChoicePage so the user can pick between
  // Swift Apply (verified profile) and a manual application form.
  const apply = () => navigate('jobApplyChoice', { jobId: job.id })

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="Job Details" actions={[
        { icon: <Bookmark size={18} />, onClick: () => showToast('Saved') },
        { icon: <Share2 size={18} />,   onClick: () => showToast('Link shared') },
      ]} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-screen-xl mx-auto w-full lg:grid lg:grid-cols-3 lg:gap-4 lg:p-4">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-2">
            {/* Header */}
            <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Building2 size={26} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-[18px] font-extrabold text-txt-primary leading-tight">{job.title}</div>
                  <button
                    onClick={() => navigate('employerProfile', { employerId: job.employerId })}
                    className="text-[13px] text-primary font-semibold mt-0.5 inline-flex items-center gap-1"
                  >
                    {job.employerName}
                    <ChevronRight size={14} />
                  </button>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {job.flagged ? <FlaggedBadge /> : <VerifiedBadge label={job.verificationStatus} verified={job.verified} />}
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-warn">
                      <Star size={11} fill="currentColor" /> {job.trustScore} ({job.reviews})
                    </span>
                    <span className="text-[10px] text-txt-tertiary">{job.posted}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-bdr-light">
                <Stat icon={<MapPin size={14} />} label="Location" value={job.destinationCity} />
                <Stat icon={<Clock size={14} />}  label="Duration" value={job.contractDuration} />
                <Stat icon={<Users size={14} />}  label="Seats"    value={job.seats.toString()} />
              </div>

              <div className="mt-4 p-3 bg-primary-light rounded-xl">
                <div className="text-[11px] text-primary font-semibold uppercase">Monthly Salary</div>
                <div className="text-[18px] font-extrabold text-primary mt-0.5">₹{job.salaryMin.toLocaleString()} – ₹{job.salaryMax.toLocaleString()}</div>
                <div className="text-[11px] text-txt-secondary">{job.salaryLocalCurrency} {job.salaryLocalMin.toLocaleString()}–{job.salaryLocalMax.toLocaleString()} · paid monthly</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <KVTile icon={<Wrench size={14} />}        label="Sector"     v={job.sector} />
                <KVTile icon={<GraduationCap size={14} />} label="Education"  v={job.educationRequirement} />
                <KVTile icon={<Languages size={14} />}     label="Language"   v={job.languageRequirement} />
                <KVTile icon={<BadgeIndianRupee size={14} />} label="Service fee" v={`₹${job.serviceFee.toLocaleString()}`} />
                <KVTile icon={<Calendar size={14} />}      label="Apply within" v={`${job.applicationDeadlineDays} days`} />
                <KVTile icon={<Clock size={14} />}         label="Experience" v={job.requiredExperience} />
              </div>
            </div>

            {/* Required skills */}
            <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
              <div className="text-[13px] font-bold text-txt-primary mb-2">Required skills</div>
              <div className="flex flex-wrap gap-2">
                {(job.requiredSkills || []).map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">{s}</span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
              <div className="text-[13px] font-bold text-txt-primary mb-2">Benefits</div>
              <div className="grid grid-cols-2 gap-2">
                <BenefitRow on={job.accommodationProvided} label="Accommodation" />
                <BenefitRow on={job.travelProvided}        label="Travel / flight" />
                <BenefitRow on={job.visaSupport}           label="Visa sponsorship" />
                <BenefitRow on={job.insuranceProvided}     label="Insurance" />
                <BenefitRow on={job.mealsProvided}         label="Meals" />
              </div>
            </div>

            {/* Contract Transparency */}
            {job.contract && (
              <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-ok" />
                  <div className="text-[13px] font-bold text-txt-primary">Contract Transparency</div>
                </div>
                <div className="space-y-2">
                  <KV k="Working hours" v={job.contract.workingHours} />
                  <KV k="Overtime"      v={job.contract.overtime} />
                  <KV k="Accommodation" v={job.contract.accommodation} />
                  <KV k="Food"          v={job.contract.food} />
                  <KV k="Visa"          v={job.contract.visa} />
                  <KV k="Return flight" v={job.contract.flightBack} />
                </div>
                <button onClick={() => showToast('Contract translated to Hindi')} className="text-[11px] font-bold text-primary mt-3">
                  View full contract (translated to Hindi) →
                </button>
              </div>
            )}
          </div>

          {/* Side column */}
          <div className="lg:col-span-1 space-y-2 mt-2 lg:mt-0">
            {/* Trust Score */}
            <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-bold text-txt-primary">Employer Trust Score</div>
                <button onClick={() => navigate('employerProfile', { employerId: job.employerId })} className="text-[11px] font-bold text-primary">View →</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-[36px] font-extrabold text-primary leading-none">{job.trustScore}</div>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={12} className={i <= Math.round(job.trustScore) ? 'text-warn fill-warn' : 'text-bdr'} />
                    ))}
                  </div>
                  <div className="text-[10px] text-txt-secondary mt-1">{job.reviews} reviews</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Bar label="Salary fairness"   v={5} />
                  <Bar label="Work conditions"   v={4} />
                  <Bar label="Accommodation"     v={4} />
                  <Bar label="Safety"            v={5} />
                </div>
              </div>
            </div>

            {/* Travel arrangement */}
            <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info-light flex items-center justify-center">
                  <Plane size={18} className="text-info" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-txt-primary">
                    {job.travelProvided ? 'Travel pre-arranged' : 'Self-arranged travel'}
                  </div>
                  <div className="text-[11px] text-txt-secondary">
                    {job.travelProvided ? 'Employer covers visa, ticket, transport' : 'You arrange visa & ticket. Loan support available.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
              <div className="text-[13px] font-bold text-txt-primary mb-3">Recent Worker Reviews</div>
              <div className="space-y-3">
                {EMPLOYER_REVIEWS.slice(0, 3).map((r, i) => (
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

            {/* Cost calc CTA */}
            <button
              onClick={() => navigate('calculator')}
              className="w-full bg-accent-light border border-accent rounded-card p-3 flex items-center gap-3"
            >
              <span className="text-[20px]">💰</span>
              <div className="flex-1 text-left">
                <div className="text-[12px] font-bold text-accent">Estimate your migration cost</div>
                <div className="text-[10px] text-txt-secondary">Visa, agent, travel, living — all in one</div>
              </div>
              <ChevronRight size={16} className="text-accent" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-bdr-light bg-white flex gap-2 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto w-full flex gap-2">
          <button
            onClick={apply}
            className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill shadow-card"
          >
            Apply Now
          </button>
          <button
            onClick={() => navigate('grievance')}
            className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center"
            aria-label="Report job"
          >
            <AlertTriangle size={18} className="text-danger" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-txt-secondary">{icon}</div>
      <div className="text-[12px] font-bold text-txt-primary mt-1">{value}</div>
      <div className="text-[10px] text-txt-tertiary">{label}</div>
    </div>
  )
}

function KV({ k, v }) {
  return (
    <div className="flex items-start justify-between text-[12px] gap-3">
      <span className="text-txt-secondary flex-shrink-0">{k}</span>
      <span className="font-semibold text-txt-primary text-right">{v}</span>
    </div>
  )
}

function KVTile({ icon, label, v }) {
  return (
    <div className="rounded-xl border border-bdr p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-txt-secondary uppercase">{icon}{label}</div>
      <div className="text-[12px] font-bold text-txt-primary mt-1 truncate">{v}</div>
    </div>
  )
}

function BenefitRow({ on, label }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${on ? 'border-ok bg-ok-light' : 'border-bdr bg-white'}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${on ? 'bg-ok text-white' : 'bg-bdr text-txt-tertiary'}`}>
        {on ? '✓' : '–'}
      </span>
      <span className={`text-[11px] font-semibold ${on ? 'text-ok' : 'text-txt-tertiary'}`}>{label}</span>
    </div>
  )
}

function Bar({ label, v }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-txt-secondary">{label}</span>
        <span className="font-bold text-txt-primary">{v}.0</span>
      </div>
      <div className="h-1.5 bg-bdr rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${v / 5 * 100}%` }} />
      </div>
    </div>
  )
}
