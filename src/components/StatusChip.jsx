import React from 'react'

const TONE = {
  success: 'bg-ok-light text-ok',
  warning: 'bg-warn-light text-warn-text',
  error:   'bg-danger-light text-danger-text',
  info:    'bg-info-light text-info',
  neutral: 'bg-surface-secondary text-txt-secondary',
  brand:   'bg-primary-50 text-primary',
}

export default function StatusChip({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold whitespace-nowrap ${TONE[tone] || TONE.neutral} ${className}`}>
      {Icon && <Icon size={11} strokeWidth={2.5} />}
      {children}
    </span>
  )
}
