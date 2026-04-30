import React from 'react'
import { AlertTriangle, Info, ShieldCheck, AlertOctagon } from 'lucide-react'

const TONE = {
  info:    { bg: 'bg-info-light',   text: 'text-info',     Icon: Info },
  warning: { bg: 'bg-warn-light',   text: 'text-warn-text', Icon: AlertTriangle },
  error:   { bg: 'bg-danger-light', text: 'text-danger',    Icon: AlertOctagon },
  success: { bg: 'bg-ok-light',     text: 'text-ok',        Icon: ShieldCheck },
}

export default function AlertBanner({ tone = 'info', title, children, className = '' }) {
  const { bg, text, Icon } = TONE[tone] || TONE.info
  return (
    <div className={`${bg} ${text} rounded-xl p-3 flex items-start gap-2 ${className}`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <div className="text-[12px] font-bold leading-tight">{title}</div>}
        {children && <div className="text-[11px] leading-relaxed mt-0.5 text-txt-secondary">{children}</div>}
      </div>
    </div>
  )
}
