import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import {
  Briefcase, Calculator, ListChecks, Plane, Send, AlertTriangle,
  Stethoscope, Wallet, Home as HomeIcon, RotateCcw, Mic, Bell, ChevronRight, ShieldCheck,
  UserPlus, ClipboardList, Siren, Award, Shield
} from 'lucide-react'
import Logo from '../components/Logo'

const QUICK_TILES = [
  { id: 'jobs',               icon: Briefcase,     title: 'Find Jobs',         color: 'bg-info-light text-info' },
  { id: 'remittance',         icon: Send,          title: 'Send Money',        color: 'bg-primary-light text-primary' },
  { id: 'loans',              icon: Wallet,        title: 'Loans',             color: 'bg-primary-light text-primary' },
  { id: 'insurance',          icon: Shield,        title: 'Insurance',         color: 'bg-primary-light text-primary' },
  { id: 'travel',             icon: Plane,         title: 'Travel',            color: 'bg-info-light text-info' },
  { id: 'calculator',         icon: Calculator,    title: 'Cost Calculator',   color: 'bg-primary-light text-primary' },
  { id: 'predeparture',       icon: ListChecks,    title: 'Pre-Departure',     color: 'bg-primary-light text-primary' },
  { id: 'postarrival',        icon: HomeIcon,      title: 'Post-Arrival',      color: 'bg-ok-light text-ok' },
  { id: 'applicationTracker', icon: ClipboardList, title: 'Applications',      color: 'bg-info-light text-info' },
  { id: 'employment',         icon: Wallet,        title: 'My Employment',     color: 'bg-info-light text-info' },
  { id: 'passport',           icon: Award,         title: 'Skill Passport',    color: 'bg-primary-light text-primary' },
  { id: 'profileSetup',       icon: UserPlus,      title: 'Profile Setup',     color: 'bg-primary-light text-primary' },
  { id: 'grievance',          icon: AlertTriangle, title: 'Grievance',         color: 'bg-danger-light text-danger' },
  { id: 'return',             icon: RotateCcw,     title: 'Return to India',   color: 'bg-primary-light text-primary' },
  { id: 'emergency',          icon: Siren,         title: 'Emergency',         color: 'bg-danger-light text-danger' },
]

export default function HomePage() {
  const { profile, navigate } = useApp()

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <div className="bg-primary text-white px-5 pt-4 pb-8 rounded-b-3xl">
        <div className="max-w-screen-md mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-card">
              <Logo size={28} />
            </div>
            <div>
              <div className="text-[11px] text-white/70">Namaste 🙏</div>
              <div className="text-[15px] font-bold">{profile.name.split(' ')[0]}</div>
            </div>
          </div>
          <button onClick={() => navigate('updates')} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>
        </div>

        <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold">Profile 75% complete</div>
            <div className="text-[10px] text-white/75">Add PCC to apply for verified jobs</div>
            <div className="h-1.5 bg-white/20 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-4 pb-20">
        <div className="max-w-screen-md mx-auto w-full">
        <button
          onClick={() => navigate('chat')}
          className="w-full bg-white rounded-card shadow-card p-4 flex items-center gap-3 mb-4 active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Mic size={18} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[13px] font-bold text-txt-primary">Ask Setu Assistant</div>
            <div className="text-[11px] text-txt-secondary">Voice or text · Hindi, English & more</div>
          </div>
          <ChevronRight size={18} className="text-txt-tertiary" />
        </button>

        <div className="text-[12px] font-bold text-txt-secondary uppercase tracking-wide mb-2 px-1">
          Quick Services
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {QUICK_TILES.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id)}
                className="h-[120px] sm:h-[136px] rounded-2xl bg-white shadow-card border border-bdr-light flex flex-col items-center justify-center text-center gap-2 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-modal active:scale-[0.98]"
              >
                <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center shrink-0`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <span className="text-[12px] font-bold text-txt-primary leading-tight line-clamp-2 text-center">
                  {t.title}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-4 text-white shadow-modal">
          <div className="text-[11px] font-semibold opacity-90 tracking-wide">SAFE MIGRATION</div>
          <div className="text-[15px] font-extrabold mt-0.5">2 verified jobs match your skills</div>
          <div className="text-[12px] opacity-90 mt-1">Industrial Electrician — Dubai · ₹62,000</div>
          <button onClick={() => navigate('jobs')} className="mt-3 bg-white text-primary text-[12px] font-bold px-4 py-2 rounded-pill hover:bg-primary-50 transition-colors">
            View Jobs →
          </button>
        </div>

        <div className="mt-5 bg-white rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-bold text-txt-primary">My Skill Passport</div>
            <button onClick={() => navigate('passport')} className="text-[11px] font-bold text-primary">View →</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {profile.skills.map(s => (
              <span key={s.name} className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                s.verified ? 'bg-ok-light text-ok' : 'bg-warn-light text-warn'
              }`}>
                {s.verified ? '✓' : '!'} {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 bg-white rounded-card shadow-card p-4">
          <div className="text-[13px] font-bold text-txt-primary mb-2">⚠️ Trust & Safety Alerts</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 bg-danger-light rounded-lg">
              <span className="text-[16px]">🚨</span>
              <div className="flex-1">
                <div className="text-[11px] font-bold text-danger">Fraud agent flagged</div>
                <div className="text-[10px] text-txt-secondary">"Quick Visa Co." in Lucknow has been blacklisted.</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
