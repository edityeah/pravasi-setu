import React from 'react'
import BrandImage from './BrandImage'
import { BRAND_ASSETS, BRAND_NAMES } from '../config/brandAssets'

// Product logomark — NSDC International is the official Pravasi Setu mark.
// Pages that need the full lockup (logo + title + tagline) should use
// `<LogoLockup variant="centered" />` instead.
export default function Logo({ size = 48, className = '' }) {
  return (
    <BrandImage
      src={BRAND_ASSETS.nsdcLogo}
      alt={BRAND_NAMES.primaryPartner}
      fallbackLabel="NSDC"
      className={className}
      style={{ width: size, height: 'auto' }}
    />
  )
}
