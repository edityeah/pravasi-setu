import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { JOBS } from '../data/mockData'
import { Briefcase, MapPin, Building2, Check, Clock, ChevronRight, Phone, MessageCircle } from 'lucide-react'

export default function ApplicationTrackerPage() {
  const { applications, params, navigate, showToast } = useApp()
  const focusId = params?.applicationId

  // If a single application is requested, show its detail. Otherwise list all.
  const focused = focusId ? applications.find(a => a.id === focusId) : null

  if (focused) {
    const job = JOBS.find(j => j.id === focused.jobId)
    return (
      <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
        <StatusBar />
        <TopBar title={`Application ${focused.id}`} sub={focused.role} />

        <div className="flex-1 overflow-y-auto pb-20">
          <div className="bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <Building2 size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-txt-primary">{focused.employerName}</div>
                <div className="text-[12px] text-txt-secondary flex items-center gap-1">
                  <MapPin size={11} /> {focused.city} · Applied {focused.appliedOn}
                </div>
              </div>
              {job && (
                <button onClick={() => navigate('jobDetail', { jobId: job.id })} className="text-[11px] font-bold text-primary">View job →</button>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-warn-light">
              <div className="text-[11px] font-bold text-warn">Next step</div>
              <div className="text-[13px] font-bold text-txt-primary mt-0.5">{focused.nextStep}</div>
            </div>
          </div>

          <div className="bg-white mt-2 p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Progress</div>
            <ol className="relative ml-2 border-l-2 border-bdr space-y-3">
              {focused.timeline.map((t, i) => (
                <li key={i} className="ml-4">
                  <span className={`absolute -left-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
                    t.done ? 'bg-ok' : t.current ? 'bg-warn' : 'bg-bdr'
                  }`}>
                    {t.done ? <Check size={10} className="text-white" /> : t.current ? <Clock size={10} className="text-white" /> : null}
                  </span>
                  <div className="text-[12px] font-bold text-txt-primary">{t.step}</div>
                  <div className="text-[10px] text-txt-secondary">{t.date}</div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white mt-2 p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Need help?</div>
            <button onClick={() => navigate('chat')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-primary-light">
              <MessageCircle size={16} className="text-primary" />
              <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Ask Setu Assistant</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
            <button onClick={() => showToast('Calling recruiter…')} className="mt-2 w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-primary-light">
              <Phone size={16} className="text-primary" />
              <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Call recruiter</div>
              <ChevronRight size={14} className="text-txt-tertiary" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="My Applications" sub={`${applications.length} active`} />

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-6">
        {applications.length === 0 && (
          <div className="text-center py-16 text-txt-tertiary text-[13px]">
            You haven't applied to any jobs yet.
          </div>
        )}

        <div className="space-y-3">
          {applications.map(a => (
            <button
              key={a.id}
              onClick={() => navigate('applicationTracker', { applicationId: a.id })}
              className="w-full bg-white rounded-card shadow-card p-4 text-left active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-txt-tertiary uppercase">{a.id}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.status.startsWith('Interview') ? 'bg-info-light text-info' :
                  a.status === 'Offer' ? 'bg-ok-light text-ok' : 'bg-warn-light text-warn'
                }`}>
                  {a.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase size={14} className="text-primary" />
                <div className="text-[13px] font-bold text-txt-primary">{a.role}</div>
              </div>
              <div className="text-[11px] text-txt-secondary mt-0.5">{a.employerName} · {a.city}</div>
              <div className="mt-3 grid grid-cols-5 gap-1">
                {a.timeline.map((t, i) => (
                  <div key={i}>
                    <div className={`h-1 rounded-full ${t.done ? 'bg-primary' : t.current ? 'bg-warn' : 'bg-bdr'}`} />
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-txt-secondary mt-2 truncate">Next: {a.nextStep}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
