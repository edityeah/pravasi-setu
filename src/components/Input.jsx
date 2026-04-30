import React from 'react'

// Pill input + label + error + helper, all per SwiftChat tokens.
export default function Input({
  label, hint, error,
  leadingIcon: Lead, trailingIcon: Trail,
  className = '',
  pill = false,
  ...rest
}) {
  const radius = pill ? 'rounded-pill' : 'rounded-xl'
  const border = error ? 'border-danger' : 'border-bdr focus-within:border-primary'
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-[11px] font-semibold text-txt-secondary uppercase tracking-wide mb-1">
          {label}
        </span>
      )}
      <span className={`flex items-center gap-2 px-3 bg-white border-2 ${radius} ${border}`}>
        {Lead ? <Lead size={16} className="text-txt-tertiary" /> : null}
        <input
          {...rest}
          className="flex-1 py-3 outline-none bg-transparent text-[14px] text-txt-primary placeholder:text-txt-tertiary"
        />
        {Trail ? <Trail size={16} className="text-txt-tertiary" /> : null}
      </span>
      {error && <span className="block text-[12px] font-medium text-danger mt-1">{error}</span>}
      {!error && hint && <span className="block text-[11px] text-txt-tertiary mt-1">{hint}</span>}
    </label>
  )
}
