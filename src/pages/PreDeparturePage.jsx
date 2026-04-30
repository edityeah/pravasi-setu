import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import {
  Check, FileText, Stethoscope, Wallet, Plane, BookOpen, Scale, ChevronRight, Languages
} from 'lucide-react'

const CATEGORY_META = {
  Documents:   { icon: FileText,    color: 'bg-info-light text-info' },
  Health:      { icon: Stethoscope, color: 'bg-primary-light text-primary' },
  Financial:   { icon: Wallet,      color: 'bg-warn-light text-warn-text' },
  Travel:      { icon: Plane,       color: 'bg-info-light text-info' },
  Preparation: { icon: BookOpen,    color: 'bg-primary-light text-primary' },
  Legal:       { icon: Scale,       color: 'bg-danger-light text-danger' },
}

export default function PreDeparturePage() {
  const { showToast, navigate, checklist, setChecklist } = useApp()
  const items = checklist

  const toggle = (id) => setChecklist(arr => arr.map(i => i.id === id ? { ...i, done: !i.done } : i))
  const done = items.filter(i => i.done).length
  const pct = items.length ? Math.round(done / items.length * 100) : 0

  const grouped = items.reduce((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i)
    return acc
  }, {})

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title="Pre-Departure" sub={`${done} of ${items.length} ready`} dark />

      <div className="bg-primary text-white px-5 pb-5">
        <div className="max-w-screen-lg mx-auto w-full">
          <div className="text-[12px] opacity-80">Departure readiness</div>
          <div className="text-[28px] font-extrabold leading-tight">{pct}%</div>
          <div className="h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 -mt-3 pb-6">
        <div className="max-w-screen-lg mx-auto w-full space-y-5">
          {/* Services before departure */}
          <section>
            <div className="px-1 mb-3">
              <h2 className="text-[15px] font-extrabold text-txt-primary">Services before departure</h2>
              <p className="text-[12px] text-txt-secondary mt-0.5">Loans, insurance, visa, travel and readiness support.</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              <ServiceTile icon="🏦" label="Loans"           onClick={() => navigate('loans')} />
              <ServiceTile icon="🛡️" label="Insurance (PBBY)" onClick={() => navigate('insurance', { category: 'PBBY' })} />
              <ServiceTile icon="💱" label="Forex"           onClick={() => navigate('remittance')} />
              <ServiceTile icon="🛂" label="Visa help"       onClick={() => showToast('Visa assistance — coming soon')} />
              <ServiceTile icon="✈️" label="Tickets"         onClick={() => navigate('travel')} />
              <ServiceTile icon="💉" label="Vaccines"        onClick={() => showToast('GAMCA centres — coming soon')} />
              <ServiceTile icon="🗣️" label="Language"        onClick={() => navigate('chat')} />
              <ServiceTile icon="📜" label="Contract review" onClick={() => showToast('Contract translation — coming soon')} />
              <ServiceTile icon="🚔" label="PCC"             onClick={() => navigate('certificate', { certId: 'cert-weld' })} />
            </div>
          </section>

          {/* Checklist */}
          <section>
            <div className="flex items-center justify-between px-1 mb-3">
              <h2 className="text-[15px] font-extrabold text-txt-primary">Departure checklist</h2>
              <span className="text-[11px] font-bold text-primary">{done}/{items.length} ready</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(grouped).map(([cat, list]) => {
                const meta = CATEGORY_META[cat] || CATEGORY_META.Documents
                const Icon = meta.icon
                const catDone = list.filter(i => i.done).length
                return (
                  <div key={cat} className="bg-white rounded-2xl shadow-card border border-bdr-light p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${meta.color} flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                      <div className="text-[13px] font-bold text-txt-primary">{cat}</div>
                      <div className="ml-auto text-[10px] font-bold text-txt-tertiary">
                        {catDone}/{list.length}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {list.map(item => (
                        <button
                          key={item.id}
                          onClick={() => toggle(item.id)}
                          className="w-full flex items-center gap-3 py-2 px-1 active:bg-surface-secondary rounded-lg transition-colors"
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                            item.done ? 'bg-ok border-ok' : 'border-bdr'
                          }`}>
                            {item.done && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-[12px] flex-1 text-left ${item.done ? 'line-through text-txt-tertiary' : 'text-txt-primary'}`}>
                            {item.title}
                          </span>
                          <ChevronRight size={14} className="text-txt-tertiary" />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Legal toolkit + language */}
          <section className="grid gap-3 md:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-danger-light flex items-center justify-center">
                  <Scale size={16} className="text-danger" />
                </div>
                <div className="text-[13px] font-bold text-txt-primary">Legal Toolkit</div>
              </div>
              <p className="text-[11px] text-txt-secondary mb-3">
                Country-specific policies, FAQs, and contract translation help.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Tag>UAE Labour Law</Tag>
                <Tag>KSA Kafala</Tag>
                <Tag>Worker Rights FAQ</Tag>
                <Tag>Embassy contacts</Tag>
              </div>
            </div>

            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-card">
                <Languages size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-primary">Learn basic Arabic</div>
                <div className="text-[11px] text-txt-secondary">10-minute daily lessons · Voice + text</div>
              </div>
              <button
                onClick={() => navigate('chat')}
                className="text-[12px] font-bold text-white bg-primary px-3 py-2 rounded-pill hover:bg-primary-dark transition-colors"
              >
                Start
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ServiceTile({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-card border border-bdr-light px-3 py-4 min-h-[96px] sm:min-h-[104px] flex flex-col items-center justify-center gap-2 text-center active:scale-[0.98] hover:border-primary hover:-translate-y-0.5 hover:shadow-modal transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
        <span className="text-[20px] leading-none">{icon}</span>
      </div>
      <span className="text-[11px] sm:text-[12px] font-bold text-txt-primary leading-tight line-clamp-2">
        {label}
      </span>
    </button>
  )
}

function Tag({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-surface-secondary text-[11px] font-semibold text-txt-secondary">
      {children}
    </span>
  )
}
