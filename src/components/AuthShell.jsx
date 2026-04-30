import React from 'react'

// Centered, max-width-capped shell for auth/onboarding pages.
//
// On desktop, raw inputs/buttons inside an h-screen flex column would stretch
// edge-to-edge — that's the bug this fixes. AuthShell pins the form column to
// 560px while letting the page background fill the viewport.
//
// `withTopBar` lets pages with their own TopBar nest inside the same shell
// without the TopBar shrinking to 560px (TopBar stays full-width).
export default function AuthShell({ children, scroll = true, className = '' }) {
  return (
    <div
      className={[
        'flex-1 min-h-0 w-full flex flex-col items-center bg-[var(--color-background-default)]',
        scroll ? 'overflow-y-auto' : '',
        className,
      ].join(' ')}
    >
      <div className="w-full max-w-[560px] flex flex-col px-4 sm:px-6 py-6 sm:py-8 gap-6">
        {children}
      </div>
    </div>
  )
}
