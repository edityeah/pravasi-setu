import React, { useState } from 'react'

// <img> wrapper that swaps to a text label if the source fails to load —
// production must never show a broken-image icon.
export default function BrandImage({ src, alt, fallbackLabel, className = '', style }) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <span
        className={`inline-flex items-center justify-center px-2 rounded-md bg-primary-light text-primary text-[11px] font-bold ${className}`}
        style={style}
      >
        {fallbackLabel || alt}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  )
}
