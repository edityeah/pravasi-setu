import React from 'react'
import BrandImage from './BrandImage'
import { BRAND_ASSETS, BRAND_NAMES } from '../config/brandAssets'

// NSDC International is the official product mark.
//   variant="centered"  → stacked logo + title + tagline (auth pages, splash)
//   variant="horizontal"→ inline logo + text block (page headers)
//   variant="compact"   → small inline lockup (top bars)
//   variant="iconOnly"  → just the logomark (avatars / favicons)
export default function LogoLockup({
  variant = 'centered',
  size,
  subtitle,
  showTagline = false,
  className = '',
}) {
  const img = (w) => (
    <BrandImage
      src={BRAND_ASSETS.nsdcLogo}
      alt={BRAND_NAMES.primaryPartner}
      fallbackLabel="NSDC"
      style={{ width: w, height: 'auto' }}
    />
  )

  if (variant === 'iconOnly') {
    return <span className={className}>{img(size || 36)}</span>
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {img(size || 28)}
        <span className="text-[14px] font-extrabold text-txt-primary">{BRAND_NAMES.product}</span>
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {img(size || 48)}
        <div>
          <div className="text-[16px] font-extrabold text-txt-primary leading-tight">{BRAND_NAMES.product}</div>
          {subtitle && <div className="text-[11px] text-txt-secondary mt-0.5">{subtitle}</div>}
        </div>
      </div>
    )
  }

  // centered (default)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {img(size || 72)}
      <div className="text-[20px] font-extrabold text-txt-primary mt-3">{BRAND_NAMES.product}</div>
      {showTagline && (
        <div className="text-[12px] text-txt-secondary mt-1">{BRAND_NAMES.productTagline}</div>
      )}
      {subtitle && (
        <div className="text-[12px] text-txt-secondary mt-1">{subtitle}</div>
      )}
    </div>
  )
}
