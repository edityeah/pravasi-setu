import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import { VerifiedBadge, FlaggedBadge } from '../components/VerifiedBadge'
import { JOBS, COUNTRIES, SECTORS } from '../data/mockData'
import { Search, SlidersHorizontal, MapPin, Star, Building2, ShieldCheck, ChevronRight, X } from 'lucide-react'

const SKILL_OPTIONS = ['all', 'Electrician','Plumber','Mason','Carpenter','Beautician','Staff Nurse','Security Guard','AC Technician','Housekeeping Staff','Waiter']
const DURATION_OPTIONS = [
  { id: 'all',  label: 'Any duration' },
  { id: 'lt2',  label: '1–2 years' },
  { id: '3',    label: '3 years' },
  { id: 'gt3',  label: '4+ years' },
]
const SALARY_BUCKETS = [
  { id: 'all',  label: 'Any salary' },
  { id: '50',   label: '₹50K+',  min: 50000 },
  { id: '70',   label: '₹70K+',  min: 70000 },
  { id: '1L',   label: '₹1L+',   min: 100000 },
  { id: '1.3L', label: '₹1.3L+', min: 130000 },
]

export default function JobsPage() {
  const { navigate } = useApp()
  const [country, setCountry] = useState('all')
  const [skill, setSkill] = useState('all')
  const [sector, setSector] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [salaryBucket, setSalaryBucket] = useState('all')
  const [duration, setDuration] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return JOBS.filter(j => {
      if (country !== 'all' && j.countryCode !== country) return false
      if (skill !== 'all' && j.title !== skill) return false
      if (sector !== 'all' && j.sector !== sector) return false
      if (verifiedOnly && !j.verified) return false
      if (salaryBucket !== 'all') {
        const b = SALARY_BUCKETS.find(b => b.id === salaryBucket)
        if (b && j.salaryMin < b.min) return false
      }
      if (duration !== 'all') {
        const months = j.contractMonths
        if (duration === 'lt2'  && months > 24) return false
        if (duration === '3'    && months !== 36) return false
        if (duration === 'gt3'  && months < 48) return false
      }
      if (q) {
        const ql = q.toLowerCase()
        if (!j.title.toLowerCase().includes(ql) &&
            !j.employerName.toLowerCase().includes(ql) &&
            !j.destinationCity.toLowerCase().includes(ql) &&
            !(j.requiredSkills || []).some(s => s.toLowerCase().includes(ql))) return false
      }
      return true
    })
  }, [country, skill, sector, verifiedOnly, salaryBucket, duration, q])

  const activeFilterCount = (country !== 'all') + (skill !== 'all') + (sector !== 'all') +
    (verifiedOnly ? 1 : 0) + (salaryBucket !== 'all') + (duration !== 'all')

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <div className="bg-white border-b border-bdr-light px-4 pt-4 pb-3">
        <div className="max-w-screen-xl mx-auto w-full">
          <h1 className="text-[20px] font-extrabold text-txt-primary">Find Jobs Abroad</h1>
          <p className="text-[11px] text-txt-secondary">{JOBS.length} verified postings · From migrant_jobs_dataset</p>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 flex items-center bg-surface-secondary rounded-pill px-3">
              <Search size={16} className="text-txt-tertiary" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search title, employer, city or skill"
                className="flex-1 py-2.5 px-2 text-[13px] outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                activeFilterCount > 0 || showFilters ? 'bg-primary text-white' : 'bg-primary-light text-primary'
              }`}
            >
              <SlidersHorizontal size={16} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center px-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Country chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <Chip active={country === 'all'} onClick={() => setCountry('all')}>🌐 All</Chip>
            {COUNTRIES.slice(0, 6).map(c => (
              <Chip key={c.code} active={country === c.code} onClick={() => setCountry(c.code)}>
                {c.flag} {c.name}
              </Chip>
            ))}
          </div>

          {showFilters && (
            <div className="mt-3 p-3 bg-surface-secondary rounded-card">
              <FilterGroup label="Skill / role">
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_OPTIONS.map(s => (
                    <Chip key={s} small active={skill === s} onClick={() => setSkill(s)}>
                      {s === 'all' ? 'All roles' : s}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup label="Sector">
                <div className="flex flex-wrap gap-1.5">
                  <Chip small active={sector === 'all'} onClick={() => setSector('all')}>All</Chip>
                  {SECTORS.map(s => (
                    <Chip key={s} small active={sector === s} onClick={() => setSector(s)}>{s}</Chip>
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup label="Salary (min)">
                <div className="flex flex-wrap gap-1.5">
                  {SALARY_BUCKETS.map(b => (
                    <Chip key={b.id} small active={salaryBucket === b.id} onClick={() => setSalaryBucket(b.id)}>
                      {b.label}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup label="Contract duration">
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_OPTIONS.map(d => (
                    <Chip key={d.id} small active={duration === d.id} onClick={() => setDuration(d.id)}>
                      {d.label}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>
              <button
                onClick={() => setVerifiedOnly(v => !v)}
                className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full ${
                  verifiedOnly ? 'bg-ok-light text-ok' : 'bg-white border border-bdr text-txt-secondary'
                }`}
              >
                <ShieldCheck size={12} /> Verified employers only
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setCountry('all'); setSkill('all'); setSector('all'); setVerifiedOnly(false); setSalaryBucket('all'); setDuration('all') }}
                  className="ml-2 mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-danger"
                >
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
        <div className="max-w-screen-xl mx-auto w-full">
          <div className="text-[11px] text-txt-secondary mb-2">{filtered.length} jobs match</div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(j => (
              <JobCard key={j.id} job={j} onClick={() => navigate('jobDetail', { jobId: j.id })} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-txt-tertiary text-[13px]">No jobs match your filters.</div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function FilterGroup({ label, children }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] font-bold text-txt-secondary uppercase mb-1">{label}</div>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children, small }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 ${small ? 'px-3 py-1 text-[11px]' : 'px-3.5 py-1.5 text-[12px]'} rounded-pill font-semibold transition-colors whitespace-nowrap ${
        active ? 'bg-primary text-white' : 'bg-white border border-bdr text-txt-secondary'
      }`}
    >
      {children}
    </button>
  )
}

export function JobCard({ job, onClick }) {
  return (
    <button onClick={onClick} className="w-full bg-white rounded-card shadow-card p-4 text-left active:scale-[0.99] transition-transform">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-bold text-txt-primary truncate">{job.title}</div>
          </div>
          <div className="text-[12px] text-txt-secondary truncate">{job.employerName}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {job.flagged ? <FlaggedBadge /> : job.verified ? <VerifiedBadge /> : <VerifiedBadge verified={false} />}
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-warn">
              <Star size={11} fill="currentColor" /> {job.trustScore} <span className="text-txt-tertiary font-normal">({job.reviews})</span>
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-secondary text-txt-secondary">
              {job.contractDuration}
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="text-txt-tertiary flex-shrink-0 mt-2" />
      </div>
      <div className="mt-3 pt-3 border-t border-bdr-light flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-txt-secondary">
          <MapPin size={12} /> {job.destinationCity}, {job.destinationCountry}
        </div>
        <div className="text-[12px] font-bold text-primary">₹{job.salaryMin.toLocaleString()}–₹{job.salaryMax.toLocaleString()}</div>
      </div>
    </button>
  )
}
