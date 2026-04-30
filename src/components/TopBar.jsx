import React from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function TopBar({ title, sub, dark = false, actions = [], onBack, closeButton = false }) {
  const { goBack } = useApp()
  const handleBack = onBack || goBack

  const btnCls = dark
    ? 'text-white active:bg-white/15'
    : 'text-txt-primary active:bg-surface-secondary'

  return (
    <div className={`h-14 px-1 flex items-center gap-1 flex-shrink-0 border-b ${
      dark ? 'bg-primary border-transparent' : 'bg-white border-bdr-light'
    }`}>
      <button
        onClick={handleBack}
        className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${btnCls}`}
        aria-label="Back"
      >
        {closeButton ? <X size={20} /> : <ArrowLeft size={20} />}
      </button>

      <div className="flex-1 min-w-0 ml-1">
        <div className={`text-[15px] font-bold truncate ${dark ? 'text-white' : 'text-txt-primary'}`}>
          {title}
        </div>
        {sub && (
          <div className={`text-[11px] truncate ${dark ? 'text-white/75' : 'text-txt-secondary'}`}>
            {sub}
          </div>
        )}
      </div>

      <div className="flex ml-auto items-center">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${btnCls}`}
            aria-label={a.label || ''}
          >
            {a.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
