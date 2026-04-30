import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { Plane, FileText, Briefcase, GraduationCap, Scale, ChevronRight, RotateCcw } from 'lucide-react'

const STEPS = [
  { icon: FileText,      title: 'Visa closure',         sub: 'Cancel work permit · Get exit clearance' },
  { icon: Plane,         title: 'Book return ticket',   sub: 'Compare airlines · ₹18,000 onwards' },
  { icon: Scale,         title: 'Legal closure',        sub: 'Final settlement, gratuity, no-dues' },
  { icon: Briefcase,     title: 'Find jobs in India',   sub: '12 matches in Lucknow · Skill mapped' },
  { icon: GraduationCap, title: 'Skill recognition',    sub: 'Map UAE certifications to NSDC' },
]

export default function ReturnPage() {
  const { navigate, showToast } = useApp()

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title="Return & Reintegration" dark />

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Hero — blue gradient (was orange/yellow) */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white px-5 pt-2 pb-7">
          <div className="max-w-screen-lg mx-auto w-full">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={24} />
              </div>
              <div className="flex-1">
                <div className="text-[18px] font-extrabold leading-tight">Coming home?</div>
                <p className="text-[12px] opacity-90 mt-1">
                  We'll help you close abroad chapters and re-enter the Indian job market with your earned skills.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 -mt-4 space-y-5">
          {/* Steps */}
          <div className="grid gap-3 md:grid-cols-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <button
                  key={i}
                  onClick={() => showToast(s.title)}
                  className="w-full bg-white rounded-2xl shadow-card border border-bdr-light p-4 flex items-center gap-3 active:scale-[0.99] hover:border-primary hover:-translate-y-0.5 hover:shadow-modal transition-all text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-txt-primary">{s.title}</div>
                    <div className="text-[11px] text-txt-secondary">{s.sub}</div>
                  </div>
                  <ChevronRight size={16} className="text-txt-tertiary flex-shrink-0" />
                </button>
              )
            })}
          </div>

          {/* Skill reuse mapping */}
          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[14px] font-bold text-txt-primary">Skill reuse mapping</div>
              <button onClick={() => navigate('passport')} className="text-[11px] font-bold text-primary">
                View Skill Passport →
              </button>
            </div>
            <div className="space-y-2">
              <Map src="UAE Industrial Electrician" dst="NSDC Electrician Level 5" />
              <Map src="OSHA Safety Cert"           dst="DGFASLI Safety Officer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Map({ src, dst }) {
  return (
    <div className="flex items-center gap-2 text-[11px] flex-wrap">
      <span className="px-2.5 py-1 rounded-full bg-info-light text-info font-semibold">{src}</span>
      <span className="text-txt-tertiary">→</span>
      <span className="px-2.5 py-1 rounded-full bg-ok-light text-ok font-semibold">{dst}</span>
    </div>
  )
}
