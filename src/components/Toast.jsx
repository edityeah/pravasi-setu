import React from 'react'
import { useApp } from '../context/AppContext'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export default function Toast() {
  const { toast } = useApp()
  if (!toast.visible) return null

  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2
  const bg = toast.type === 'error' ? 'bg-danger' : toast.type === 'info' ? 'bg-info' : 'bg-ok'

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-50 animate-fade-in">
      <div className={`${bg} text-white px-4 py-3 rounded-pill shadow-modal flex items-center gap-2 max-w-[90vw]`}>
        <Icon size={18} />
        <span className="text-[13px] font-semibold">{toast.message}</span>
      </div>
    </div>
  )
}
