import React from 'react'

// Form-width helper for sub-flows / modal-style screens (e.g. Aadhaar eKYC,
// DigiLocker consent). Keeps the input column ≤640px on desktop while letting
// any header/footer stay full-width.
export default function FormShell({ children, className = '', maxWidth = 640 }) {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 ${className}`} style={{ maxWidth }}>
      {children}
    </div>
  )
}
