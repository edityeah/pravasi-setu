import React from 'react'
import { Check, Clock, AlertTriangle } from 'lucide-react'

// Vertical timeline used by Application/Transfer/Ticket pages.
//   item shape: { step, date, note, done?, current?, exception? }
export default function Timeline({ items = [] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-bdr-light space-y-3">
      {items.map((t, i) => {
        const tone = t.exception ? 'bg-danger'
                  : t.done       ? 'bg-ok'
                  : t.current    ? 'bg-warn'
                  :                'bg-bdr';
        const Icon = t.exception ? AlertTriangle
                   : t.done      ? Check
                   : t.current   ? Clock
                   : null;
        return (
          <li key={i} className="ml-4">
            <span className={`absolute -left-[9px] w-4 h-4 rounded-full flex items-center justify-center ${tone}`}>
              {Icon && <Icon size={10} className="text-white" strokeWidth={3} />}
            </span>
            <div className="text-[12px] font-bold text-txt-primary">{t.step}</div>
            <div className="text-[10px] text-txt-secondary">{t.date}</div>
            {t.note && <div className="text-[11px] text-txt-secondary mt-0.5">{t.note}</div>}
          </li>
        )
      })}
    </ol>
  )
}
