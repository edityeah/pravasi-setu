// Centralised brand assets — every page/component imports from here so a
// single change updates the whole app. Hosted URLs are used so production
// builds (Vercel / Netlify / static CDN) don't depend on the public/ files
// surviving the deployment pipeline.
export const BRAND_ASSETS = {
  nsdcLogo:        'https://i.ibb.co/9H89wt8w/NSDC.png',
  convegeniusLogo: 'https://i.ibb.co/p6Qd3bcL/Convegenius.png',
  favicon:         'https://i.ibb.co/9H89wt8w/NSDC.png',
}

export const BRAND_NAMES = {
  product: 'Pravasi Setu',
  productTagline: 'Your trusted bridge for migration',
  primaryPartner: 'NSDC International',
  techPartner: 'ConveGenius',
}
