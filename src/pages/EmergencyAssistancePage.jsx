import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import {
  Phone, Siren, ShieldAlert, Building, Heart, MapPin, MessageCircle, ChevronRight, Mic, Languages
} from 'lucide-react'

const HOTLINES = [
  { label: 'MADAD (MEA)',                    num: '+91 11 4078 8870', sub: '24×7 · Govt. of India',  icon: Siren,        color: 'bg-danger text-white' },
  { label: 'Indian Embassy — UAE',           num: '+971 4 397 1222',  sub: 'Dubai consulate',         icon: Building,     color: 'bg-info text-white' },
  { label: 'Indian Embassy — Saudi Arabia',  num: '+966 11 488 4144', sub: 'Riyadh consulate',        icon: Building,     color: 'bg-info text-white' },
  { label: 'Pravasi Bharatiya Sahayata',     num: '+91 11 2310 0011', sub: 'Pravasi grievance kendra',icon: ShieldAlert,  color: 'bg-primary text-white' },
  { label: 'Local Police (UAE)',             num: '999',              sub: 'Emergency · UAE',         icon: Siren,        color: 'bg-danger text-white' },
  { label: 'Local Ambulance (UAE)',          num: '998',              sub: 'Medical emergency · UAE', icon: Heart,        color: 'bg-ok text-white' },
]

const SCENARIOS = [
  { label: 'Employer not paying salary',     route: 'grievance' },
  { label: 'Passport / documents seized',    route: 'grievance' },
  { label: 'Physical abuse or unsafe site',  route: 'grievance' },
  { label: 'Medical emergency / accident',   route: null, toast: 'Calling 998 ambulance' },
  { label: 'Lost / stranded',                route: 'chat' },
  { label: 'Legal / immigration trouble',    route: 'grievance' },
]

export default function EmergencyAssistancePage() {
  const { navigate, showToast } = useApp()

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title="Emergency Assistance" sub="24×7 · Multilingual" dark />

      <div className="bg-danger text-white px-5 pb-6 pt-4">
        <div className="max-w-screen-xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
            <Siren size={26} />
          </div>
          <div className="flex-1">
            <div className="text-[18px] font-extrabold leading-tight">You're not alone</div>
            <p className="text-[12px] opacity-90 mt-0.5">
              One tap connects you to embassy, MEA helpline, NGOs, and our legal team.
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('SOS sent · Location shared with embassy', 'error')}
          className="w-full mt-4 bg-white text-danger font-extrabold text-[15px] py-4 rounded-pill flex items-center justify-center gap-2 shadow-modal"
        >
          <Siren size={18} /> Send SOS with my location
        </button>
        <p className="text-[10px] opacity-80 mt-1 text-center">Shares GPS, profile and last 3 locations</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-screen-xl mx-auto w-full">
        {/* Scenarios */}
        <div className="px-4 pt-4">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2">What's happening?</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {SCENARIOS.map(s => (
              <button
                key={s.label}
                onClick={() => s.route ? navigate(s.route) : showToast(s.toast)}
                className="bg-white rounded-card shadow-card p-3 text-left active:scale-[0.98]"
              >
                <div className="text-[12px] font-bold text-txt-primary">{s.label}</div>
                <div className="text-[10px] text-primary mt-1">Get help →</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hotlines */}
        <div className="px-4 mt-4">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2">Tap to call</div>
          <div className="bg-white rounded-card shadow-card p-2 grid grid-cols-1 lg:grid-cols-2 gap-1">
            {HOTLINES.map(h => {
              const Icon = h.icon
              return (
                <button
                  key={h.label}
                  onClick={() => showToast(`Calling ${h.label} (${h.num})`)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg active:bg-surface-secondary"
                >
                  <div className={`w-10 h-10 rounded-xl ${h.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[13px] font-bold text-txt-primary">{h.label}</div>
                    <div className="text-[10px] text-txt-secondary">{h.sub}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-bold text-primary">{h.num}</div>
                    <Phone size={12} className="text-primary inline" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Multilingual / chat */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Languages size={16} className="text-primary" />
              <div className="text-[13px] font-bold text-txt-primary">Speak in your language</div>
            </div>
            <p className="text-[11px] text-txt-secondary leading-relaxed">
              Press the mic and describe the situation in Hindi, Malayalam, Tamil, Telugu, Bengali or Marathi. Setu translates and routes to the right authority.
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => navigate('chat')} className="flex-1 bg-primary text-white font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2">
                <MessageCircle size={14} /> Open Setu Chat
              </button>
              <button onClick={() => showToast('Recording…')} className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <Mic size={18} className="text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Where am I */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-card shadow-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info-light flex items-center justify-center">
              <MapPin size={18} className="text-info" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-bold text-txt-primary">Share my live location</div>
              <div className="text-[10px] text-txt-secondary">With embassy + family · for the next 60 min</div>
            </div>
            <button onClick={() => showToast('Live location sharing started')} className="text-[11px] font-bold text-primary">Start →</button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
