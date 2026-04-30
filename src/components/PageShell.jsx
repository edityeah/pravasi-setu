import React from 'react'

// Centralised responsive width container.
//   size="form"    → 560px (auth, simple forms)
//   size="content" → 768px (single-column content / detail pages)
//   size="wide"    → 1280px (workflow pages, dashboards)
const SIZE = {
  form:    'max-w-[560px]',
  content: 'max-w-screen-md',  // 768px
  wide:    'max-w-screen-xl',  // 1280px
}

export default function PageShell({ size = 'wide', className = '', as: Tag = 'div', children }) {
  return (
    <Tag className={`${SIZE[size] || SIZE.wide} mx-auto w-full px-4 sm:px-6 ${className}`}>
      {children}
    </Tag>
  )
}
