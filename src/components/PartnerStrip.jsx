import React from 'react'
import BrandImage from './BrandImage'
import { BRAND_ASSETS, BRAND_NAMES } from '../config/brandAssets'

// "Powered by ConveGenius · In partnership with NSDC International" trust strip.
// Used on Splash, KYC, Skill Passport, Certificate Verification, and Remittance.
export default function PartnerStrip({ compact = false, className = '' }) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <BrandImage
          src={BRAND_ASSETS.convegeniusLogo}
          alt={BRAND_NAMES.techPartner}
          fallbackLabel="ConveGenius"
          className="h-5 w-auto opacity-80"
        />
        <span className="text-txt-tertiary text-[10px]">·</span>
        <BrandImage
          src={BRAND_ASSETS.nsdcLogo}
          alt={BRAND_NAMES.primaryPartner}
          fallbackLabel="NSDC"
          className="h-5 w-auto opacity-90"
        />
      </div>
    )
  }
  return (
    <div className={`bg-white rounded-card border border-bdr-light p-3 ${className}`}>
      <div className="flex items-center justify-center gap-5">
        <div className="flex flex-col items-center">
          <BrandImage
            src={BRAND_ASSETS.convegeniusLogo}
            alt={BRAND_NAMES.techPartner}
            fallbackLabel="ConveGenius"
            className="h-9 w-auto"
          />
          <span className="text-[9px] text-txt-secondary mt-1">Powered by ConveGenius</span>
        </div>
        <span className="w-px h-9 bg-bdr-light" />
        <div className="flex flex-col items-center">
          <BrandImage
            src={BRAND_ASSETS.nsdcLogo}
            alt={BRAND_NAMES.primaryPartner}
            fallbackLabel="NSDC International"
            className="h-9 w-auto"
          />
          <span className="text-[9px] text-txt-secondary mt-1">In partnership with NSDC</span>
        </div>
      </div>
    </div>
  )
}
