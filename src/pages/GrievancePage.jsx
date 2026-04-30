import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
// `tickets` come from AppContext (so newly raised ones appear too)
import {
  AlertTriangle, Phone, Wallet, Building, Shield, Mic, Send, CheckCircle2, Clock, ChevronRight, Plus
} from 'lucide-react'

const CATEGORIES = [
  { id: 'salary',     label: 'Salary dispute',       icon: Wallet,         color: 'bg-warn-light text-warn' },
  { id: 'employer',   label: 'Employer issue',       icon: Building,       color: 'bg-info-light text-info' },
  { id: 'safety',     label: 'Abuse / unsafe',       icon: Shield,         color: 'bg-danger-light text-danger' },
  { id: 'legal',      label: 'Legal',                icon: AlertTriangle,  color: 'bg-primary-light text-primary' },
]

export default function GrievancePage() {
  const { showToast, navigate, tickets, addTicket } = useApp()
  const [creating, setCreating] = useState(false)
  const [cat, setCat] = useState(null)
  const [desc, setDesc] = useState('')
  const [voiceAttached, setVoiceAttached] = useState(false)
  const [touched, setTouched] = useState(false)

  const descMin = 20
  const catError  = !cat ? 'Pick a category to continue.' : null
  const descError = !voiceAttached && desc.trim().length < descMin
    ? `Describe what happened (at least ${descMin} characters), or attach a voice note.` : null
  const canSubmit = !catError && !descError

  const submit = () => {
    const id = `PS-${2100 + tickets.length}`
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const catLabel = CATEGORIES.find(c => c.id === cat)?.label || 'General'
    addTicket({
      id,
      title: desc.slice(0, 80) || catLabel,
      description: desc,
      category: catLabel,
      status: 'In Progress',
      date: today,
      priority: 'Medium',
      routedTo: ['MEA / MADAD', 'Indian Embassy', 'Pravasi Setu Legal'],
      assignedOfficer: 'Auto-assigned · Pravasi Setu Triage',
      timeline: [
        { step: 'Filed',         date: today,   done: true,  note: 'Ticket raised via app' },
        { step: 'Under review',  date: 'Pending', done: false, current: true, note: 'Routing to embassy + legal team' },
        { step: 'Action taken',  date: 'Pending', done: false },
        { step: 'Resolved',      date: 'Pending', done: false },
      ],
    })
    showToast(`Grievance ${id} raised · Embassy notified`)
    setCreating(false); setCat(null); setDesc('')
    navigate('ticketDetail', { ticketId: id })
  }

  if (creating) {
    return (
      <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
        <StatusBar />
        <TopBar title="Raise Grievance" closeButton onBack={() => setCreating(false)} />

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
          <div className="max-w-screen-md mx-auto w-full">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2">Category</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {CATEGORIES.map(c => {
              const Icon = c.icon
              const active = cat === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`p-3 rounded-card border-2 text-left transition-colors ${
                    active ? 'border-primary bg-primary-light' : 'border-bdr bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${c.color} flex items-center justify-center mb-2`}>
                    <Icon size={16} />
                  </div>
                  <div className="text-[12px] font-bold text-txt-primary">{c.label}</div>
                </button>
              )
            })}
          </div>
          {touched && catError && <p className="text-[11px] text-danger font-medium mb-2">{catError}</p>}

          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2 mt-3">Describe what happened</div>
          <div className={`bg-white rounded-card border-2 p-3 ${touched && descError ? 'border-danger' : 'border-bdr'}`}>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={5}
              placeholder="When · Where · Who · Amount (if any) ..."
              className="w-full text-[13px] outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-bdr-light">
              <button
                onClick={() => { setVoiceAttached(true); showToast('Voice note recorded') }}
                className={`flex items-center gap-1 text-[11px] font-bold ${voiceAttached ? 'text-ok' : 'text-primary'}`}
              >
                <Mic size={14} /> {voiceAttached ? 'Voice note attached ✓' : 'Voice note'}
              </button>
              <button onClick={() => showToast('Photo attached')} className="text-[11px] font-bold text-primary">
                + Attach evidence
              </button>
            </div>
            <div className="text-[10px] text-txt-tertiary mt-1">{desc.trim().length}/{descMin} characters minimum</div>
          </div>
          {touched && descError && <p className="text-[11px] text-danger font-medium mt-1">{descError}</p>}
          </div>

          <div className="mt-4 p-3 bg-info-light rounded-xl">
            <div className="text-[11px] font-bold text-info">Routes to:</div>
            <div className="text-[10px] text-txt-secondary leading-relaxed mt-1">
              MEA · Indian Embassy in UAE · NGO partner (Migrants Forum Asia) · Pravasi Setu legal team
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-bdr-light bg-white flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('emergency')}
            className="flex-1 bg-danger text-white font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-1"
          >
            <Phone size={14} /> Emergency
          </button>
          <button
            onClick={() => { setTouched(true); if (canSubmit) submit() }}
            disabled={!canSubmit}
            className="flex-1 bg-primary text-white font-bold text-[13px] py-3 rounded-pill disabled:bg-primary-200 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title="Grievance Redressal" sub="Safe escalation · 24×7 support" dark />

      <div className="bg-primary text-white px-5 pb-5">
        <div className="max-w-screen-md mx-auto w-full">
          <p className="text-[12px] opacity-90 mb-3">
            You're not alone. Raise grievances against employers, agents or unsafe conditions — we route to the right authority.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('emergency')}
              className="flex-1 bg-danger rounded-pill py-3 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-danger/90 transition-colors"
            >
              <Phone size={14} /> Emergency Help
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex-1 bg-white text-primary rounded-pill py-3 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors"
            >
              <Plus size={14} /> Raise New
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-screen-md mx-auto w-full">
        <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2">My tickets</div>
        <div className="space-y-2">
          {tickets.map(g => (
            <button
              key={g.id}
              onClick={() => navigate('ticketDetail', { ticketId: g.id })}
              className="w-full bg-white rounded-card shadow-card p-4 text-left active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-txt-tertiary uppercase">{g.id}</div>
                  <div className="text-[13px] font-bold text-txt-primary mt-0.5">{g.title}</div>
                  <div className="text-[10px] text-txt-secondary mt-1">{g.category} · Raised {g.date}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                  g.status === 'Resolved' ? 'bg-ok-light text-ok' : 'bg-warn-light text-warn'
                }`}>
                  {g.status === 'Resolved' ? <CheckCircle2 size={10} className="inline mr-0.5" /> : <Clock size={10} className="inline mr-0.5" />}
                  {g.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {(g.timeline || []).map((t, i) => (
                  <div key={i}>
                    <div className={`h-1 rounded-full ${t.done ? 'bg-primary' : t.current ? 'bg-warn' : 'bg-bdr'}`} />
                    <div className={`text-[9px] mt-1 truncate ${t.done || t.current ? 'text-primary font-bold' : 'text-txt-tertiary'}`}>{t.step}</div>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-card shadow-card p-4">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Helpline numbers</div>
          <Helpline label="MADAD (MEA Helpline)" num="+91 11 4078 8870" />
          <Helpline label="Indian Embassy Dubai" num="+971 4 397 1222" />
          <Helpline label="Pravasi Bharatiya Sahayata Kendra" num="+91 11 2310 0011" />
        </div>
        </div>
      </div>
    </div>
  )
}

function Helpline({ label, num }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-lg bg-danger-light flex items-center justify-center">
        <Phone size={14} className="text-danger" />
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-bold text-txt-primary">{label}</div>
        <div className="text-[11px] text-primary font-semibold">{num}</div>
      </div>
      <ChevronRight size={14} className="text-txt-tertiary" />
    </div>
  )
}
