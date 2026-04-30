import React from 'react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'

export function VerifiedBadge({ verified = true, label }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ok-light text-ok text-[10px] font-bold">
        <ShieldCheck size={11} strokeWidth={2.5} />
        {label || 'Verified'}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warn-light text-warn text-[10px] font-bold">
      <ShieldAlert size={11} strokeWidth={2.5} />
      {label || 'Pending'}
    </span>
  )
}

export function FlaggedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-light text-danger text-[10px] font-bold">
      ⚠ Flagged
    </span>
  )
}
