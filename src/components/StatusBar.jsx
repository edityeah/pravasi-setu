import React, { useState, useEffect } from 'react'
import { Wifi, Battery, Signal } from 'lucide-react'
import { useIsEmbedded } from '../agentic/EmbeddedContext'

export default function StatusBar({ dark = false }) {
  // Hide phone chrome when rendered inside the agentic canvas (desktop shell
  // already provides its own header / clock — a simulated phone status bar
  // here just looks confusing).
  const embedded = useIsEmbedded()
  if (embedded) return null
  return <StatusBarChrome dark={dark} />
}

function StatusBarChrome({ dark }) {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
  useEffect(() => {
    const iv = setInterval(() =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 30000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className={`h-[22px] px-3.5 flex items-center justify-between text-[11px] font-bold flex-shrink-0 ${
      dark ? 'bg-primary text-white' : 'bg-white text-txt-primary'
    }`}>
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={12} strokeWidth={2.5} />
        <Wifi size={12} strokeWidth={2.5} />
        <Battery size={14} strokeWidth={2.5} />
      </div>
    </div>
  )
}
