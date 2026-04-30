import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import {
  Home as HomeIcon, Smartphone, Bus, Languages, Globe, Phone,
  Building, HeartHandshake, Map, ChevronRight, Scale
} from 'lucide-react'

const ESSENTIALS = [
  { icon: HomeIcon,   label: 'Find Housing',          sub: '12 listings near Al Quoz' },
  { icon: Smartphone, label: 'Buy SIM card',          sub: 'Etisalat & du · ID required' },
  { icon: Bus,        label: 'Local transport',       sub: 'Nol card, taxi apps' },
  { icon: Map,        label: 'City guide',            sub: 'Markets, prayer rooms, hospitals' },
]

const SUPPORT = [
  { icon: Building,        label: 'Indian Embassy — Dubai',  sub: '+971 4 397 1222 · 24×7' },
  { icon: HeartHandshake,  label: 'NGO support',             sub: 'Migrants Forum Asia' },
  { icon: Phone,           label: 'Indian Community Group',  sub: 'WhatsApp · 850 members' },
  { icon: Scale,           label: 'Legal aid',               sub: 'Free for migrant workers' },
]

export default function PostArrivalPage() {
  const { showToast } = useApp()

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="Post-Arrival Support" sub="Settling in Dubai, UAE 🇦🇪" />

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Welcome card */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-5">
          <div className="text-[12px] opacity-90">Welcome to Dubai 👋</div>
          <div className="text-[18px] font-extrabold mt-0.5">First 30 days</div>
          <p className="text-[12px] opacity-90 mt-1">Track your settling-in tasks, find essentials and connect with help nearby.</p>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="Time here" value="3 days" />
            <Stat label="Tasks done" value="4 / 9" />
            <Stat label="Saved ₹" value="—" />
          </div>
        </div>

        {/* Essentials */}
        <Section title="Essentials">
          <div className="grid grid-cols-2 gap-3">
            {ESSENTIALS.map(e => {
              const Icon = e.icon
              return (
                <button
                  key={e.label}
                  onClick={() => showToast(e.label)}
                  className="bg-white rounded-card shadow-card p-3 text-left active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mb-2">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className="text-[12px] font-bold text-txt-primary">{e.label}</div>
                  <div className="text-[10px] text-txt-secondary mt-0.5">{e.sub}</div>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Adaptation */}
        <Section title="Adaptation">
          <div className="bg-white rounded-card shadow-card p-4">
            <Row icon={Languages} title="Learn basic Arabic" sub="Daily 10 min · streak: 3 days" />
            <Row icon={Globe}     title="Country guide"      sub="UAE rules · weather · culture" />
            <Row icon={Phone}     title="Emergency numbers"  sub="Police 999 · Ambulance 998" />
          </div>
        </Section>

        {/* Support ecosystem */}
        <Section title="Support Ecosystem">
          <div className="bg-white rounded-card shadow-card p-4 space-y-2">
            {SUPPORT.map(s => {
              const Icon = s.icon
              return (
                <button key={s.label} onClick={() => showToast(s.label)} className="w-full flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-lg bg-info-light flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-info" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[12px] font-bold text-txt-primary">{s.label}</div>
                    <div className="text-[10px] text-txt-secondary">{s.sub}</div>
                  </div>
                  <ChevronRight size={14} className="text-txt-tertiary" />
                </button>
              )
            })}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="px-4 mt-4">
      <div className="text-[12px] font-bold text-txt-secondary uppercase tracking-wide mb-2">{title}</div>
      {children}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl p-2.5">
      <div className="text-[10px] opacity-80">{label}</div>
      <div className="text-[14px] font-extrabold mt-0.5">{value}</div>
    </div>
  )
}

function Row({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-bold text-txt-primary">{title}</div>
        <div className="text-[10px] text-txt-secondary">{sub}</div>
      </div>
      <ChevronRight size={14} className="text-txt-tertiary" />
    </div>
  )
}
