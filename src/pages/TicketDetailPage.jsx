import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { Check, Clock, MessageCircle, Phone, ChevronRight, Building, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function TicketDetailPage() {
  const { tickets, params, navigate, showToast } = useApp()
  const ticket = tickets.find(t => t.id === params.ticketId) || tickets[0]
  if (!ticket) return null

  const isOpen = ticket.status !== 'Resolved'

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar title={`Ticket ${ticket.id}`} sub={ticket.category} dark />

      <div className="bg-primary text-white px-5 pb-5">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isOpen ? 'bg-warn text-white' : 'bg-ok text-white'
          }`}>
            {isOpen ? <Clock size={10} className="inline mr-1" /> : <Check size={10} className="inline mr-1" />}
            {ticket.status}
          </span>
          <span className="text-[10px] opacity-80">Filed {ticket.date}</span>
        </div>
        <div className="text-[18px] font-extrabold mt-2 leading-tight">{ticket.title}</div>
        <p className="text-[12px] opacity-90 mt-1 leading-relaxed">{ticket.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Routed to */}
        <div className="bg-white p-5">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Routed to</div>
          <div className="space-y-2">
            {ticket.routedTo?.map(r => (
              <div key={r} className="flex items-center gap-3 p-3 rounded-xl bg-info-light">
                <div className="w-9 h-9 rounded-lg bg-info text-white flex items-center justify-center">
                  <Building size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-info">{r}</div>
                </div>
              </div>
            ))}
          </div>
          {ticket.assignedOfficer && (
            <div className="mt-3 p-3 rounded-xl border border-bdr">
              <div className="text-[10px] text-txt-secondary uppercase">Assigned officer</div>
              <div className="text-[13px] font-bold text-txt-primary mt-0.5">{ticket.assignedOfficer}</div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white mt-2 p-5">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Timeline</div>
          <ol className="relative ml-2 border-l-2 border-bdr space-y-3">
            {ticket.timeline.map((t, i) => (
              <li key={i} className="ml-4">
                <span className={`absolute -left-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
                  t.done ? 'bg-ok' : t.current ? 'bg-warn' : 'bg-bdr'
                }`}>
                  {t.done ? <Check size={10} className="text-white" /> : t.current ? <Clock size={10} className="text-white" /> : null}
                </span>
                <div className="text-[12px] font-bold text-txt-primary">{t.step}</div>
                <div className="text-[10px] text-txt-secondary">{t.date}</div>
                {t.note && <div className="text-[11px] text-txt-secondary mt-0.5">{t.note}</div>}
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="bg-white mt-2 p-5">
          <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Quick actions</div>
          <button onClick={() => navigate('chat')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-primary-light mb-2">
            <MessageCircle size={16} className="text-primary" />
            <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Chat with case officer</div>
            <ChevronRight size={14} className="text-txt-tertiary" />
          </button>
          <button onClick={() => showToast('Embassy line dialled')} className="w-full flex items-center gap-3 p-3 rounded-card border border-bdr active:bg-primary-light">
            <Phone size={16} className="text-primary" />
            <div className="flex-1 text-left text-[13px] font-bold text-txt-primary">Call embassy</div>
            <ChevronRight size={14} className="text-txt-tertiary" />
          </button>
        </div>

        {!isOpen && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-ok-light flex items-start gap-2">
            <ShieldCheck size={14} className="text-ok mt-0.5" />
            <p className="text-[11px] text-ok leading-relaxed">
              This ticket has been resolved. If the issue recurs, file a new grievance — your case history is preserved.
            </p>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="px-4 py-3 border-t border-bdr-light bg-white flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('emergency')}
            className="flex-1 bg-danger text-white font-bold text-[13px] py-3 rounded-pill flex items-center justify-center gap-2"
          >
            <AlertTriangle size={14} /> Escalate / Emergency
          </button>
        </div>
      )}
    </div>
  )
}
