import React from 'react'
import { Phone } from 'lucide-react'
import { useVoiceCall } from './VoiceCallProvider'

// Pill button that starts the realtime voice call. The actual call lives in
// VoiceCallProvider at app root, so the modal + floating pill are mounted
// globally — clicking this button just kicks off / re-expands the call.
export default function VoiceAgentButton({ variant = 'primary', label = 'Talk to Pravasi Setu Assistant', className = '' }) {
  const { startCall } = useVoiceCall()

  const cls = variant === 'primary'
    ? 'bg-primary hover:bg-primary-dark text-white shadow-card'
    : variant === 'subtle'
      ? 'bg-primary-light text-primary hover:bg-primary hover:text-white'
      : 'bg-white border-2 border-primary text-primary hover:bg-primary-light'

  return (
    <button
      onClick={startCall}
      className={`inline-flex items-center gap-2 rounded-pill px-4 py-2.5 text-[13px] font-bold transition-colors ${cls} ${className}`}
    >
      <Phone size={14} />
      {label}
    </button>
  )
}
