import React from 'react'

// Variants follow swiftchat-design-system.md §1.1 button colours.
const VARIANT = {
  primary:     'bg-primary text-white disabled:bg-primary-200 disabled:text-white',
  secondary:   'bg-white text-primary border-[1.5px] border-primary disabled:opacity-40',
  ghost:       'bg-transparent text-primary disabled:opacity-40',
  destructive: 'bg-danger text-white disabled:opacity-40',
  inverse:     'bg-white text-txt-primary disabled:opacity-40',
}
// Pill shape per the design system's "Button (all sizes) → radius/full" rule.
const SIZE = {
  lg: 'h-14 px-5 text-[16px]',
  md: 'h-11 px-4 text-[14px]',
  sm: 'h-9  px-3 text-[12px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  leadingIcon: Lead,
  trailingIcon: Trail,
  fullWidth,
  ...rest
}) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold',
        'transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:shadow-focus',
        'disabled:cursor-not-allowed',
        SIZE[size],
        VARIANT[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {Lead ? <Lead size={16} /> : null}
      <span className="truncate">{children}</span>
      {Trail ? <Trail size={16} /> : null}
    </button>
  )
}
