import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { COUNTRIES } from '../data/mockData'
import { Calculator, TrendingUp, Wallet, ChevronRight } from 'lucide-react'

export default function CalculatorPage() {
  const { navigate } = useApp()
  const [country, setCountry] = useState('AE')
  const [job, setJob] = useState('Electrician')
  const [agentFee, setAgentFee] = useState(45000)
  const [visa, setVisa] = useState(12000)
  const [travel, setTravel] = useState(28000)
  const [living, setLiving] = useState(15000)
  const [salary, setSalary] = useState(62000)

  const total = agentFee + visa + travel + living
  const breakeven = total > 0 && salary > 0 ? Math.ceil(total / (salary - 20000)) : 0
  const recommendedLoan = Math.max(0, total - 30000)
  const affordable = salary > 30000 && total < salary * 4

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="Migration Cost Calculator" sub="Plan your finances honestly" />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-screen-xl mx-auto w-full lg:grid lg:grid-cols-2 lg:gap-4 lg:p-4">
        <div className="bg-white p-5 lg:rounded-card lg:shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Calculator size={18} className="text-accent" />
            </div>
            <div className="text-[13px] font-bold text-txt-primary">Tell us your destination</div>
          </div>

          <Field label="Destination country">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {COUNTRIES.slice(0, 6).map(c => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  className={`flex-shrink-0 px-3 py-2 rounded-pill text-[12px] font-semibold border-2 ${
                    country === c.code ? 'border-primary bg-primary-light text-primary' : 'border-bdr text-txt-secondary'
                  }`}
                >
                  {c.flag} {c.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Job type">
            <select
              value={job}
              onChange={e => setJob(e.target.value)}
              className="w-full border-2 border-bdr rounded-xl px-3 py-3 text-[13px] outline-none focus:border-primary bg-white"
            >
              {['Electrician', 'Welder', 'Plumber', 'Driver', 'Helper', 'Nurse'].map(j => <option key={j}>{j}</option>)}
            </select>
          </Field>

          <Field label={`Agent fees ₹${agentFee.toLocaleString()}`}>
            <input type="range" min={0} max={200000} step={5000} value={agentFee} onChange={e => setAgentFee(+e.target.value)} className="w-full accent-primary" />
          </Field>
          <Field label={`Visa cost ₹${visa.toLocaleString()}`}>
            <input type="range" min={0} max={50000} step={1000} value={visa} onChange={e => setVisa(+e.target.value)} className="w-full accent-primary" />
          </Field>
          <Field label={`Travel cost ₹${travel.toLocaleString()}`}>
            <input type="range" min={0} max={80000} step={1000} value={travel} onChange={e => setTravel(+e.target.value)} className="w-full accent-primary" />
          </Field>
          <Field label={`Initial living (3 months) ₹${living.toLocaleString()}`}>
            <input type="range" min={0} max={60000} step={1000} value={living} onChange={e => setLiving(+e.target.value)} className="w-full accent-primary" />
          </Field>
          <Field label={`Expected monthly salary ₹${salary.toLocaleString()}`}>
            <input type="range" min={20000} max={200000} step={1000} value={salary} onChange={e => setSalary(+e.target.value)} className="w-full accent-primary" />
          </Field>
        </div>

        <div className="lg:flex lg:flex-col lg:gap-3 lg:mt-0">
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white mx-4 lg:mx-0 mt-4 lg:mt-0 rounded-card p-5 shadow-modal">
          <div className="text-[11px] opacity-80 uppercase font-semibold">Total migration cost</div>
          <div className="text-[34px] font-extrabold leading-tight">₹{total.toLocaleString()}</div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Pill icon={<TrendingUp size={14} />} label="Break-even" value={`${breakeven} months`} />
            <Pill icon={<Wallet size={14} />}     label="Suggested loan" value={`₹${recommendedLoan.toLocaleString()}`} />
          </div>

          <div className={`mt-4 p-3 rounded-xl ${affordable ? 'bg-ok/30' : 'bg-danger/30'}`}>
            <div className="text-[12px] font-bold">
              {affordable ? '✅ Looks affordable' : '⚠️ Reconsider — high cost vs. salary'}
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {affordable
                ? `You can recover this cost in roughly ${breakeven} months of earnings.`
                : 'Total cost is more than 4 months salary. Negotiate fees or pick another job.'}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white mx-4 lg:mx-0 mt-3 lg:mt-0 rounded-card p-4 shadow-card">
          <div className="text-[12px] font-bold text-txt-primary mb-3">Breakdown</div>
          {[
            { label: 'Agent fees',       v: agentFee, color: 'bg-accent' },
            { label: 'Visa',             v: visa,     color: 'bg-info' },
            { label: 'Travel',           v: travel,   color: 'bg-primary' },
            { label: 'Initial living',   v: living,   color: 'bg-warn' },
          ].map(r => (
            <div key={r.label} className="mb-2">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-txt-secondary">{r.label}</span>
                <span className="font-bold text-txt-primary">₹{r.v.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-bdr rounded-full overflow-hidden">
                <div className={`h-full ${r.color} rounded-full`} style={{ width: `${total ? r.v / total * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('predeparture')}
          className="mx-4 lg:mx-0 mt-3 w-[calc(100%-32px)] lg:w-full bg-primary-light border border-primary rounded-card p-3 flex items-center gap-3"
        >
          <span className="text-[20px]">📋</span>
          <div className="flex-1 text-left">
            <div className="text-[12px] font-bold text-primary">Continue to Pre-departure checklist</div>
            <div className="text-[10px] text-txt-secondary">Track docs, loans, insurance, vaccines</div>
          </div>
          <ChevronRight size={16} className="text-primary" />
        </button>
        </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mt-3">
      <div className="text-[11px] font-semibold text-txt-secondary mb-1.5">{label}</div>
      {children}
    </div>
  )
}

function Pill({ icon, label, value }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] opacity-80">{icon}{label}</div>
      <div className="text-[14px] font-extrabold mt-0.5">{value}</div>
    </div>
  )
}
