import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { Wallet, FileText, Calendar, Download, ChevronRight, TrendingUp } from 'lucide-react'

const PAYSLIPS = [
  { month: 'April 2026',    gross: 62000, net: 51200, deduction: 10800, status: 'Paid' },
  { month: 'March 2026',    gross: 62000, net: 51200, deduction: 10800, status: 'Paid' },
  { month: 'February 2026', gross: 62000, net: 51200, deduction: 10800, status: 'Paid' },
]

export default function EmploymentPage() {
  const { showToast } = useApp()

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title="My Employment" sub="Al Habtoor Construction · Dubai" dark />

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Salary header — full-width gradient, content capped */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white px-5 py-5">
          <div className="max-w-screen-xl mx-auto w-full">
            <div className="text-[11px] opacity-80 uppercase font-semibold tracking-wide">This month's net pay</div>
            <div className="text-[32px] font-extrabold mt-0.5">₹51,200</div>
            <div className="text-[11px] opacity-90">Paid on 1 May 2026</div>

            <div className="grid grid-cols-3 gap-2 mt-4 sm:max-w-md">
              <Stat label="Gross"      value="₹62,000" />
              <Stat label="Deductions" value="₹10,800" />
              <Stat label="EMI"        value="₹4,500" />
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 -mt-3 space-y-4">
          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Tile icon={FileText} label="Contract"   onClick={() => showToast('Contract opened')} />
            <Tile icon={Calendar} label="Attendance" onClick={() => showToast('Attendance log')} />
            <Tile icon={Wallet}   label="EMI / Tax"  onClick={() => showToast('Deduction details')} />
          </div>

          {/* Two-column on desktop: payslips left, trend right */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2 px-1">Salary slips</div>
              <div className="bg-white rounded-2xl shadow-card border border-bdr-light overflow-hidden">
                {PAYSLIPS.map((p, i) => (
                  <div key={i} className={`p-4 flex items-center gap-3 ${i ? 'border-t border-bdr-light' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-ok-light flex items-center justify-center">
                      <Wallet size={16} className="text-ok" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-txt-primary">{p.month}</div>
                      <div className="text-[11px] text-txt-secondary">Net ₹{p.net.toLocaleString()} · {p.status}</div>
                    </div>
                    <button onClick={() => showToast('Payslip downloaded')} className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-100 transition-colors">
                      <Download size={14} className="text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[12px] font-bold text-txt-secondary uppercase mb-2 px-1">Earnings trend</div>
              <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] font-bold text-txt-primary">Last 7 months</div>
                  <span className="text-[11px] text-ok flex items-center gap-1 font-bold">
                    <TrendingUp size={12} /> +4.2%
                  </span>
                </div>
                <div className="h-32 flex items-end gap-2">
                  {[40, 55, 50, 62, 58, 62, 62].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary-light rounded-t-md overflow-hidden flex items-end" style={{ height: `${h}%` }}>
                      <div className="w-full bg-primary rounded-t-md" style={{ height: '60%' }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-txt-tertiary mt-2 font-semibold">
                  {['Nov','Dec','Jan','Feb','Mar','Apr','May'].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl p-2.5">
      <div className="text-[10px] opacity-80">{label}</div>
      <div className="text-[13px] font-extrabold mt-0.5">{value}</div>
    </div>
  )
}

function Tile({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl shadow-card border border-bdr-light p-4 flex flex-col items-center gap-2 active:scale-[0.98] hover:border-primary hover:-translate-y-0.5 hover:shadow-modal transition-all">
      <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
        <Icon size={18} className="text-primary" />
      </div>
      <span className="text-[11px] font-bold text-txt-primary">{label}</span>
    </button>
  )
}
