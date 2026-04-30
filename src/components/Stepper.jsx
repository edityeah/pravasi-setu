import React from 'react'

// Horizontal stepper for multi-step flows (remittance, profile setup, KYC).
export default function Stepper({ steps, current, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <span
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                  done ? 'bg-primary text-white'
                       : active ? 'bg-primary text-white ring-4 ring-primary-100'
                                : 'bg-bdr-light text-txt-tertiary',
                ].join(' ')}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={`mt-1 text-[10px] font-semibold truncate w-full text-center ${active ? 'text-primary' : 'text-txt-tertiary'}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={`h-0.5 flex-1 ${i < current ? 'bg-primary' : 'bg-bdr-light'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
