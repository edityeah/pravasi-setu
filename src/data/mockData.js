import { MIGRANT_JOBS, MIGRANT_EMPLOYERS, SECTORS, DEST_COUNTRIES } from './migrantJobsData'

// ─── Countries ──────────────────────────────────────────────────────────────
// Derived from the dataset, plus extra GCC/SE-Asia countries for the calculator.
const EXTRA_COUNTRIES = [
  { code: 'BH', name: 'Bahrain',   flag: '🇧🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia',  flag: '🇲🇾' },
]
export const COUNTRIES = [...DEST_COUNTRIES, ...EXTRA_COUNTRIES]

// ─── Jobs ───────────────────────────────────────────────────────────────────
// Adapter that maps dataset records onto the field shape used by older pages
// (employer / city / salary / employerVerified / contract / etc).
function adaptJob(j) {
  return {
    ...j,
    employer: j.employerName,
    city: j.destinationCity,
    country: j.destinationCountry,
    skill: j.requiredSkills?.[0] || j.sector,
    salary: j.salaryLabel,
    salaryNum: j.salaryAvg,
    duration: j.contractDuration,
    travelArranged: j.travelProvided,
    employerVerified: j.verified,
    contract: {
      transparent: j.verified,
      workingHours: '8 hrs/day · 6 days/week',
      overtime: '1.5× after 8 hrs',
      accommodation: j.accommodationProvided ? 'Provided (shared)' : 'Self',
      food: j.mealsProvided ? 'Provided' : 'Self',
      visa: j.visaSupport ? 'Sponsored by employer' : 'Self-arranged',
      flightBack: j.travelProvided ? `After ${Math.max(1, Math.floor(j.contractMonths / 12))} year(s)` : 'Self-arranged',
    },
  }
}

export const JOBS = MIGRANT_JOBS.map(adaptJob)
export { SECTORS }
export const EMPLOYERS = MIGRANT_EMPLOYERS

// ─── Reviews (employer level) ──────────────────────────────────────────────
export const EMPLOYER_REVIEWS = [
  { name: 'Suresh M.', rating: 5, salary: 5, conditions: 5, accommodation: 4, safety: 5, comment: 'Salary always paid on time. Accommodation is decent.', date: '2 weeks ago', verified: true },
  { name: 'Vikash K.', rating: 4, salary: 5, conditions: 4, accommodation: 3, safety: 5, comment: 'Good company. Food allowance was small but everything else fair.', date: '1 month ago', verified: true },
  { name: 'Mohan P.',  rating: 5, salary: 5, conditions: 4, accommodation: 4, safety: 5, comment: 'Worked here 2 years. No exploitation. Recommend.',           date: '2 months ago', verified: true },
  { name: 'Arif S.',   rating: 3, salary: 4, conditions: 3, accommodation: 3, safety: 4, comment: 'OK overall. Long working hours during peak season.',            date: '3 months ago', verified: true },
]

// (REMITTANCE_PROVIDERS, RECIPIENTS, PAYOUT_METHODS etc. are defined below alongside transfers.)

// ─── Notifications ─────────────────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: 'n1', kind: 'job',     title: 'New job match: Industrial Electrician — Dubai', body: 'Salary ₹62,000. Verified employer. Apply now.', time: '10 min ago', urgent: false },
  { id: 'n2', kind: 'visa',    title: 'Visa appointment confirmed', body: 'Sat, 10 May · 11:00 AM at VFS Lucknow.', time: '1 h ago',   urgent: false },
  { id: 'n3', kind: 'payment', title: 'Loan EMI due in 3 days',     body: '₹4,500 due on 3 May. Pay now to avoid penalty.', time: 'Yesterday', urgent: true },
  { id: 'n4', kind: 'fraud',   title: '⚠️ Fraud alert in your area', body: 'Agent "Quick Visa Co." flagged. Avoid contact.',   time: '2 d ago',   urgent: true },
  { id: 'n5', kind: 'support', title: 'Grievance #PS-2031 updated', body: 'Embassy contacted your employer. Awaiting response.', time: '3 d ago', urgent: false },
]

// ─── Grievance tickets (with timeline) ─────────────────────────────────────
export const GRIEVANCES = [
  {
    id: 'PS-2031',
    title: 'Salary delay — 2 months pending',
    category: 'Financial',
    status: 'In Progress',
    date: '15 Apr 2026',
    priority: 'High',
    description: 'Employer has not paid March or April salary. Total pending ₹1,24,000. HR is unresponsive.',
    routedTo: ['MEA / MADAD', 'Indian Embassy — Dubai', 'Pravasi Setu Legal'],
    assignedOfficer: 'R. Iyer · MEA Grievance Cell',
    timeline: [
      { step: 'Filed',         date: '15 Apr 2026', note: 'Ticket raised via app',                                done: true },
      { step: 'Under review',  date: '16 Apr 2026', note: 'Auto-routed to MADAD + Embassy Dubai',                  done: true },
      { step: 'Action taken',  date: '22 Apr 2026', note: 'Embassy contacted employer, demanded reply in 7 days', done: false, current: true },
      { step: 'Resolved',      date: 'Pending',     note: 'Awaiting employer response',                            done: false },
    ],
  },
  {
    id: 'PS-1987',
    title: 'Accommodation unsafe — water leakage',
    category: 'Safety',
    status: 'Resolved',
    date: '02 Mar 2026',
    priority: 'Medium',
    description: 'Severe water leakage in shared accommodation, electrical hazard reported with photos.',
    routedTo: ['Indian Embassy — Dubai', 'Migrants Forum Asia'],
    assignedOfficer: 'P. Mehta · MFA Field Officer',
    timeline: [
      { step: 'Filed',         date: '02 Mar 2026', note: 'Ticket raised via app',                       done: true },
      { step: 'Under review',  date: '03 Mar 2026', note: 'Embassy notified',                            done: true },
      { step: 'Action taken',  date: '08 Mar 2026', note: 'Field officer inspection completed',         done: true },
      { step: 'Resolved',      date: '21 Mar 2026', note: 'Repairs done, alternate housing arranged',   done: true },
    ],
  },
]

// ─── Suggested chatbot prompts ─────────────────────────────────────────────
export const SUGGESTED_PROMPTS = [
  'Find jobs in Dubai',
  'Salary for nurses in Qatar',
  'Is my employer safe?',
  'Verified jobs only',
  'Documents for Saudi Arabia',
  'Migration cost',
  'Send money home',
  'Track my transfer',
  'Talk to support',
  'Urgent help',
]

// ─── Pre-departure checklist ───────────────────────────────────────────────
export const PRE_DEPARTURE_CHECKLIST = [
  { id: 'passport', title: 'Valid Passport (min 6 months)', done: true,  category: 'Documents' },
  { id: 'visa',     title: 'Work Visa',                      done: true,  category: 'Documents' },
  { id: 'pcc',      title: 'Police Clearance Certificate (PCC)', done: false, category: 'Documents' },
  { id: 'medical',  title: 'GAMCA Medical Test',             done: true,  category: 'Health' },
  { id: 'vacc',     title: 'Vaccinations (Yellow Fever, Polio)', done: false, category: 'Health' },
  { id: 'insurance',title: 'Health & Travel Insurance (PBBY)', done: true, category: 'Financial' },
  { id: 'loan',     title: 'Migration Loan Approval',        done: false, category: 'Financial' },
  { id: 'remit',    title: 'Open Remittance Account',        done: true,  category: 'Financial' },
  { id: 'flight',   title: 'Flight Booking',                 done: false, category: 'Travel' },
  { id: 'lang',     title: 'Basic Arabic phrases',           done: false, category: 'Preparation' },
  { id: 'culture',  title: 'Cultural orientation video',     done: true,  category: 'Preparation' },
  { id: 'contract', title: 'Contract reviewed (translated)', done: true,  category: 'Legal' },
  { id: 'embassy',  title: 'Save embassy emergency contact', done: false, category: 'Legal' },
]

// ─── Certificates with verification status ─────────────────────────────────
export const CERTIFICATES = [
  {
    id: 'cert-iti',
    name: 'ITI Electrician — NCVT',
    issuer: 'Govt. ITI Lucknow',
    year: 2018,
    verified: true,
    verificationStatus: 'Verified',
    verifiedOn: '12 Jan 2026',
    verifierAuthority: 'NCVT (National Council for Vocational Training)',
    certNumber: 'NCVT/UP/2018/4521',
    blockchainHash: '0xa92f…7e21',
    skills: ['Electrician', 'Wiring'],
    expiry: 'Lifetime',
    digilockerLinked: true,
  },
  {
    id: 'cert-nsdc',
    name: 'Skill India — Electrician Level 4',
    issuer: 'NSDC',
    year: 2020,
    verified: true,
    verificationStatus: 'Verified',
    verifiedOn: '12 Jan 2026',
    verifierAuthority: 'NSDC / PMKVY',
    certNumber: 'NSDC/2020/0992345',
    blockchainHash: '0x32d1…a8c4',
    skills: ['Electrician'],
    expiry: '2027',
    digilockerLinked: true,
  },
  {
    id: 'cert-weld',
    name: 'Welding Safety Course',
    issuer: 'CIPET',
    year: 2022,
    verified: false,
    verificationStatus: 'Pending — Awaiting issuer confirmation',
    verifiedOn: null,
    verifierAuthority: 'CIPET',
    certNumber: 'CIPET/WLD/2022/8810',
    blockchainHash: null,
    skills: ['Welding'],
    expiry: '2027',
    digilockerLinked: false,
    timeline: [
      { step: 'Submitted',          date: '02 Apr 2026', done: true },
      { step: 'Sent to issuer',     date: '05 Apr 2026', done: true },
      { step: 'Awaiting response',  date: 'In progress', done: false, current: true },
      { step: 'Verified & on-chain',date: 'Pending',     done: false },
    ],
  },
]

// ─── Sample applications (Application Tracker) ─────────────────────────────
export const APPLICATIONS = [
  {
    id: 'APP-3081',
    jobId: JOBS[0]?.id,
    employerName: JOBS[0]?.employerName,
    role: JOBS[0]?.title,
    city: JOBS[0]?.destinationCity,
    appliedOn: '24 Apr 2026',
    status: 'Interview scheduled',
    nextStep: 'Online interview · 03 May, 11:00 AM',
    timeline: [
      { step: 'Application submitted',     date: '24 Apr 2026', done: true },
      { step: 'Profile shortlisted',        date: '26 Apr 2026', done: true },
      { step: 'Interview scheduled',        date: '28 Apr 2026', done: true, current: true },
      { step: 'Offer letter',               date: 'Pending',     done: false },
      { step: 'Visa & travel',              date: 'Pending',     done: false },
    ],
  },
  {
    id: 'APP-3055',
    jobId: JOBS[1]?.id,
    employerName: JOBS[1]?.employerName,
    role: JOBS[1]?.title,
    city: JOBS[1]?.destinationCity,
    appliedOn: '18 Apr 2026',
    status: 'Profile shortlisted',
    nextStep: 'Awaiting interview slot',
    timeline: [
      { step: 'Application submitted', date: '18 Apr 2026', done: true },
      { step: 'Profile shortlisted',    date: '23 Apr 2026', done: true, current: true },
      { step: 'Interview scheduled',    date: 'Pending',     done: false },
      { step: 'Offer letter',           date: 'Pending',     done: false },
      { step: 'Visa & travel',          date: 'Pending',     done: false },
    ],
  },
]

// ─── Remittance recipients ─────────────────────────────────────────────────
// (See india_remittance_feature_research.md §12.2 for the recipient model.)
export const RECIPIENTS = [
  {
    id: 'rec_001',
    fullName: 'Sunita Kumar',
    relationship: 'Wife',
    country: 'India',
    mobile: '+91 98421 ••821',
    avatarColor: 'bg-primary',
    initials: 'SK',
    methods: [
      { type: 'UPI',  upiId: 'sunita@oksbi', verifiedName: 'SUNITA KUMAR' },
      { type: 'BANK', bankName: 'State Bank of India', accountMasked: 'XXXXXX8821', ifsc: 'SBIN0001234', branch: 'Lucknow Main' },
    ],
    lastSent: '15 Apr 2026',
  },
  {
    id: 'rec_002',
    fullName: 'Ram Prakash Kumar',
    relationship: 'Father',
    country: 'India',
    mobile: '+91 94506 ••502',
    avatarColor: 'bg-accent',
    initials: 'RP',
    methods: [
      { type: 'BANK', bankName: 'Punjab National Bank', accountMasked: 'XXXXXX4502', ifsc: 'PUNB0123400', branch: 'Lucknow Hazratganj' },
    ],
    lastSent: '10 Apr 2026',
  },
  {
    id: 'rec_003',
    fullName: 'Ajay Kumar',
    relationship: 'Brother',
    country: 'India',
    mobile: '+91 99110 ••132',
    avatarColor: 'bg-ok',
    initials: 'AK',
    methods: [
      { type: 'UPI',  upiId: 'ajay@ybl', verifiedName: 'AJAY KUMAR' },
      { type: 'CASH', city: 'Lucknow', state: 'Uttar Pradesh', preferredPartner: 'Western Union — Hazratganj' },
    ],
    lastSent: '02 Apr 2026',
  },
]

// ─── Payout / funding / providers ──────────────────────────────────────────
export const PAYOUT_METHODS = [
  { id: 'UPI',  label: 'UPI ID',         eta: 'In minutes',         feePct: 0.6, description: 'Send directly to a UPI-linked bank account using only a UPI ID.', icon: 'upi' },
  { id: 'BANK', label: 'Bank account',   eta: 'Same day · 1–3 days',feePct: 0.4, description: 'Send to most Indian bank accounts using account number and IFSC code.', icon: 'bank' },
  { id: 'CASH', label: 'Cash pickup',    eta: 'Ready today',        feePct: 1.2, description: 'Recipient collects cash from a nearby partner location with valid ID.', icon: 'cash' },
]

export const FUNDING_METHODS = [
  { id: 'debit_card',   label: 'Debit card',        eta: 'Instant',     feeNote: 'No extra fee',          icon: '💳' },
  { id: 'credit_card',  label: 'Credit card',       eta: 'Instant',     feeNote: '+1.5% issuer fee',      icon: '💳' },
  { id: 'bank_transfer',label: 'Bank transfer',     eta: '1–2 hours',   feeNote: 'Lowest cost',           icon: '🏦' },
  { id: 'wallet',       label: 'Apple/Google Pay',  eta: 'Instant',     feeNote: 'No extra fee',          icon: '📲' },
  { id: 'agent_cash',   label: 'Pay at agent',      eta: 'During hours',feeNote: 'Walk-in option',        icon: '🏪' },
]

// Sample partner brands — labelled clearly as prototype/mock partners.
//
// Fee model anchored to real AED→INR corridor data (late 2025):
//   - midRate is the mid-market reference (interbank). UI computes the
//     provider's effective rate as midRate × (1 - spread).
//   - spreadPct is the FX margin baked into the customer-facing rate.
//   - feeAed is a FIXED fee in source currency (AED) charged on top.
//
// Effective cost % displayed to the user is:
//     (feeAed / sourceAmount) + spreadPct
// which matches Wise's published "comparison" methodology and lets a worker
// compare apples-to-apples regardless of how each provider hides cost.
//
// Defensible rounded values per late-2025 research:
//   Wise ~0.7%, NPCI/UPI ~1.5%, Remitly ~1%, WorldRemit ~2%, ICICI ~2.5%,
//   MoneyGram ~4%, Western Union ~4%, SBI bank wire ~6%.
export const REMITTANCE_PROVIDERS = [
  { id: 'wise',  name: 'Wise',                  spreadPct: 0.004, feeAed: 6,  time: 'In minutes',  logo: '🟢', tag: 'Prototype partner', highlight: 'Closest to mid-market' },
  { id: 'npci',  name: 'NPCI UPI Foreign Inward', spreadPct: 0.010, feeAed: 0,  time: 'Seconds',    logo: '🇮🇳', tag: 'Integration-ready', highlight: 'Zero fee · seconds' },
  { id: 'rmly',  name: 'Remitly Economy',        spreadPct: 0.008, feeAed: 0,  time: '3–5 days',    logo: '🟣', tag: 'Prototype partner', highlight: 'Free over AED 400' },
  { id: 'wr',    name: 'WorldRemit',             spreadPct: 0.015, feeAed: 6,  time: '< 1 hour',    logo: '🔵', tag: 'Prototype partner' },
  { id: 'icici', name: 'ICICI Money2India',      spreadPct: 0.022, feeAed: 0,  time: 'Same day',    logo: '🏛️', tag: 'Mock regulated partner', highlight: 'Fee waived' },
  { id: 'mg',    name: 'MoneyGram',              spreadPct: 0.025, feeAed: 14, time: '< 1 hour',    logo: '🟠', tag: 'Prototype partner' },
  { id: 'wu',    name: 'Western Union',          spreadPct: 0.025, feeAed: 12, time: '< 1 hour',    logo: '💸', tag: 'Prototype partner' },
  { id: 'sbi',   name: 'SBI bank wire',          spreadPct: 0.040, feeAed: 75, time: '1–3 days',    logo: '🏦', tag: 'Mock regulated partner' },
]

// Source & destination corridors. India is the only destination for this prototype.
// `rate` is the mid-market reference (interbank). The provider's effective
// rate is mid × (1 - spreadPct). UI does this multiplication explicitly so
// the user sees both the headline rate AND the FX margin baked into it.
export const SOURCE_COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', rate: 22.92 },
  { code: 'SA', name: 'Saudi Arabia',         flag: '🇸🇦', currency: 'SAR', rate: 22.34 },
  { code: 'QA', name: 'Qatar',                flag: '🇶🇦', currency: 'QAR', rate: 22.97 },
  { code: 'KW', name: 'Kuwait',               flag: '🇰🇼', currency: 'KWD', rate: 272.50 },
  { code: 'OM', name: 'Oman',                 flag: '🇴🇲', currency: 'OMR', rate: 217.40 },
  { code: 'BH', name: 'Bahrain',              flag: '🇧🇭', currency: 'BHD', rate: 222.20 },
  { code: 'US', name: 'United States',        flag: '🇺🇸', currency: 'USD', rate: 83.20 },
  { code: 'GB', name: 'United Kingdom',       flag: '🇬🇧', currency: 'GBP', rate: 105.80 },
]

// Pure helpers for the new comparison math. Kept here next to the data so
// consumers (RemittancePage QuoteStep + ReviewStep + Summary) all share the
// exact same formula and never disagree on what the recipient actually gets.
export function computeQuote({ midRate, sourceAmount, spreadPct, feeAed }) {
  const effectiveRate = +(midRate * (1 - (spreadPct || 0))).toFixed(4)
  const amountAfterFee = Math.max(0, sourceAmount - (feeAed || 0))
  const receiveAmount  = Math.round(amountAfterFee * effectiveRate)
  // What the user WOULD have gotten at mid-market with zero fee.
  const midReceive     = Math.round(sourceAmount * midRate)
  const totalCostInr   = Math.max(0, midReceive - receiveAmount)
  const totalCostPct   = sourceAmount > 0 ? (totalCostInr / midReceive) * 100 : 0
  const fxLossInr      = Math.round(amountAfterFee * (midRate - effectiveRate))
  const feeInr         = Math.round((feeAed || 0) * effectiveRate)
  return {
    effectiveRate,
    amountAfterFee,
    receiveAmount,
    midReceive,
    totalCostInr,
    totalCostPct,
    fxLossInr,   // INR equivalent of the FX margin
    feeInr,      // INR equivalent of the fixed fee
  }
}

export const TRANSFER_PURPOSES = [
  'Family maintenance',
  'Education support',
  'Medical support',
  'Gift',
  'Travel support',
  'Personal savings',
  'Other',
]

export const RATE_ALERTS = [
  { id: 'ra1', currency: 'AED', threshold: 23.00, currentRate: 22.92, status: 'Watching', createdOn: '20 Apr 2026' },
]

export const TRANSFER_SUPPORT_TICKETS = [
  { id: 'TX-301', transferId: 'TR-9802', subject: 'Receipt for tax filing', status: 'Resolved', date: '12 Apr 2026' },
]

// Status enum (kept aligned with research doc §12.3).
export const TRANSFER_STATUSES = [
  'CREATED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'KYC_REQUIRED', 'COMPLIANCE_REVIEW',
  'PROCESSING', 'SENT_TO_PARTNER', 'UPI_PROCESSING', 'BANK_PROCESSING',
  'READY_FOR_PICKUP', 'DELIVERED', 'PICKED_UP',
  'FAILED', 'CANCELLED', 'REFUND_INITIATED', 'REFUNDED',
]

// ─── Remittance / transfer tracker ─────────────────────────────────────────
export const TRANSFERS = [
  {
    id: 'TR-9821',
    from: 'You (UAE)',
    to: 'Sunita Kumar · UPI sunita@oksbi',
    sourceCurrency: 'AED',
    sourceAmount: 524,
    fxRate: 22.92,
    fee: 90,
    receiveCurrency: 'INR',
    amount: 12000,
    provider: 'Wise',
    payoutMethod: 'UPI',
    fundingMethod: 'Debit card',
    purpose: 'Family maintenance',
    initiatedOn: '24 Apr 2026 · 10:24 AM',
    eta: '24 Apr 2026 · 11:00 AM',
    status: 'UPI_PROCESSING',
    statusLabel: 'In transit · UPI processing',
    timeline: [
      { step: 'Created',                  date: '24 Apr 2026 · 10:24 AM', done: true },
      { step: 'Payment received',         date: '24 Apr 2026 · 10:25 AM', done: true },
      { step: 'Compliance review',        date: '24 Apr 2026 · 10:27 AM', done: true },
      { step: 'Sent to payout partner',   date: '24 Apr 2026 · 10:30 AM', done: true },
      { step: 'UPI processing',           date: '24 Apr 2026 · 10:32 AM', done: true, current: true },
      { step: 'Delivered',                date: 'ETA 11:00 AM',           done: false },
    ],
  },
  {
    id: 'TR-9802',
    from: 'You (UAE)',
    to: 'Ram Prakash · PNB XXXXXX4502',
    sourceCurrency: 'AED',
    sourceAmount: 218,
    fxRate: 22.88,
    fee: 0,
    receiveCurrency: 'INR',
    amount: 5000,
    provider: 'Remitly',
    payoutMethod: 'BANK',
    fundingMethod: 'Bank transfer',
    purpose: 'Family maintenance',
    initiatedOn: '10 Apr 2026 · 09:10 AM',
    eta: '10 Apr 2026',
    status: 'DELIVERED',
    statusLabel: 'Delivered',
    timeline: [
      { step: 'Created',                  date: '10 Apr 2026 · 09:10 AM', done: true },
      { step: 'Payment received',         date: '10 Apr 2026 · 09:11 AM', done: true },
      { step: 'Compliance review',        date: '10 Apr 2026 · 09:12 AM', done: true },
      { step: 'Sent to payout partner',   date: '10 Apr 2026 · 09:14 AM', done: true },
      { step: 'Bank processing',          date: '10 Apr 2026 · 09:22 AM', done: true },
      { step: 'Delivered',                date: '10 Apr 2026 · 09:38 AM', done: true },
    ],
  },
  {
    id: 'TR-9755',
    from: 'You (UAE)',
    to: 'Ajay Kumar · Cash pickup Lucknow',
    sourceCurrency: 'AED',
    sourceAmount: 87,
    fxRate: 22.78,
    fee: 200,
    receiveCurrency: 'INR',
    amount: 1800,
    provider: 'Western Union',
    payoutMethod: 'CASH',
    fundingMethod: 'Debit card',
    purpose: 'Gift',
    initiatedOn: '02 Apr 2026 · 04:12 PM',
    eta: 'Expired 09 Apr',
    status: 'REFUND_INITIATED',
    statusLabel: 'Pickup expired · Refund initiated',
    exception: 'Cash pickup expired',
    timeline: [
      { step: 'Created',                  date: '02 Apr 2026 · 04:12 PM', done: true },
      { step: 'Payment received',         date: '02 Apr 2026 · 04:13 PM', done: true },
      { step: 'Sent to payout partner',   date: '02 Apr 2026 · 04:18 PM', done: true },
      { step: 'Ready for pickup',         date: '02 Apr 2026 · 04:24 PM', done: true },
      { step: 'Pickup expired',           date: '09 Apr 2026',            exception: true },
      { step: 'Refund initiated',         date: '09 Apr 2026 · 06:00 PM', done: false, current: true },
    ],
  },
]

// ─── Service partners (loans, insurance, visa, travel, health, legal) ─────
export const SERVICE_PARTNERS = {
  loans: [
    { id: 'sbi-pravasi', name: 'SBI Pravasi Loan',     rate: '10.5% p.a.', maxAmount: '₹3,00,000', tenure: '24 months', features: ['No collateral up to ₹2L', 'Salary-linked EMI', 'Pre-approved'] },
    { id: 'union-loan',  name: 'Union Bank Foreign Job', rate: '11.0% p.a.', maxAmount: '₹2,50,000', tenure: '36 months', features: ['Govt. interest subsidy', 'EMI moratorium 3 mo'] },
    { id: 'muthoot',     name: 'Muthoot Migration Loan', rate: '14.0% p.a.', maxAmount: '₹1,50,000', tenure: '12 months', features: ['Same-day approval', 'Gold-backed option'] },
  ],
  insurance: [
    { id: 'pbby',  name: 'PBBY (Govt.)',     premium: '₹275 / 2 yrs', cover: '₹10 L', features: ['Mandatory ECR', 'Death/disability cover', 'Repatriation'] },
    { id: 'tata',  name: 'Tata AIG Migrant',  premium: '₹4,800 / yr', cover: '₹20 L', features: ['Hospital cashless', 'Personal accident'] },
    { id: 'icici', name: 'ICICI Lombard',     premium: '₹5,200 / yr', cover: '₹25 L', features: ['Trip & job cover', 'Family floater'] },
  ],
  visa: [
    { id: 'vfs',     name: 'VFS Global',        fee: '₹5,500', time: '7–10 days',  features: ['Doorstep collection', 'Status SMS'] },
    { id: 'bls',     name: 'BLS International', fee: '₹4,800', time: '10–14 days', features: ['Document scrutiny', 'Multi-country'] },
    { id: 'embassy', name: 'Direct Embassy',    fee: '₹3,500', time: '2–4 weeks',  features: ['Lowest fee', 'Self-service'] },
  ],
  travel: [
    { id: 'air-india', name: 'Air India',  fare: '₹18,400', time: '4 hr 10 min', features: ['Direct flight', '30 kg baggage'] },
    { id: 'flydubai',  name: 'flydubai',   fare: '₹16,950', time: '4 hr 25 min', features: ['Lowest fare', '20 kg baggage'] },
    { id: 'emirates',  name: 'Emirates',   fare: '₹22,300', time: '4 hr 5 min',  features: ['Premium service', '35 kg baggage'] },
  ],
  health: [
    { id: 'gamca',     name: 'GAMCA Medical Centre', fee: '₹4,500', time: 'Same day',  features: ['GCC-approved', 'Lab + X-ray'] },
    { id: 'metropolis',name: 'Metropolis Diagnostics', fee: '₹3,800', time: '24 hours', features: ['Home sample', 'Online report'] },
    { id: 'apollo',    name: 'Apollo Pre-Departure',  fee: '₹6,200', time: 'Same day',  features: ['Premium care', 'Vaccination'] },
  ],
  legal: [
    { id: 'mfa',      name: 'Migrants Forum Asia',          fee: 'Free',   features: ['NGO support', 'Multilingual', 'Field officers'] },
    { id: 'pravasi',  name: 'Pravasi Setu Legal Cell',      fee: 'Free',   features: ['Contract review', 'Grievance routing'] },
    { id: 'vakil',    name: 'Vakilsearch Migration Desk',   fee: '₹2,500', features: ['POA & affidavits', 'Family power-of-attorney'] },
  ],
}

// ─── Bottom-nav helpers / etc ──────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'mr', name: 'मराठी' },
]

// ──────────────────────────────────────────────────────────────────────────
// Financial & Mobility Services (loans / insurance / travel / affiliated
// banks & cash agents). Every provider here is a prototype/mock partner —
// see each `tag` field — none of these flows hit a real banking, insurer
// or travel API.
// ──────────────────────────────────────────────────────────────────────────

export const LOAN_NEED_CATEGORIES = [
  { id: 'travel',        label: 'Travel ticket',        icon: '✈️', defaultAmount: 18000 },
  { id: 'housing',       label: 'Housing deposit',      icon: '🏠', defaultAmount: 25000 },
  { id: 'visa',          label: 'Visa & documentation', icon: '🛂', defaultAmount: 16000 },
  { id: 'skilling',      label: 'Skilling course',      icon: '🎓', defaultAmount: 0 },
  { id: 'miscellaneous', label: 'Miscellaneous',        icon: '🧰', defaultAmount: 5000 },
]

export const LOAN_DOCUMENTS = [
  { id: 'aadhaar',  label: 'Aadhaar', required: true,  available: true  },
  { id: 'passport', label: 'Passport', required: true, available: true  },
  { id: 'contract', label: 'Job contract / offer letter', required: true, available: true },
  { id: 'visa',     label: 'Visa copy', required: false, available: false },
  { id: 'tickets',  label: 'Travel tickets', required: false, available: false },
  { id: 'pcc',      label: 'Police Clearance Certificate', required: false, available: false },
]

export const LOAN_PROVIDERS = [
  {
    id: 'sbi-pravasi',
    name: 'SBI Pravasi Loan',
    type: 'Bank',
    tag: 'Mock regulated partner',
    interestRateAnnual: 10.5,
    processingFeePercent: 1.0,
    minAmount: 25000,
    maxAmount: 300000,
    tenures: [12, 24, 36],
    relaxationPeriodDays: 60,
    requiredDocuments: ['aadhaar', 'passport', 'contract'],
    processingTime: '2 to 3 working days',
    badge: 'Best for travel',
  },
  {
    id: 'union-foreign',
    name: 'Union Bank Foreign Job Loan',
    type: 'Bank',
    tag: 'Mock regulated partner',
    interestRateAnnual: 11.0,
    processingFeePercent: 0.75,
    minAmount: 50000,
    maxAmount: 250000,
    tenures: [12, 24],
    relaxationPeriodDays: 90,
    requiredDocuments: ['aadhaar', 'passport', 'contract'],
    processingTime: '3 to 5 working days',
    badge: 'Govt. interest subsidy',
  },
  {
    id: 'pnb-overseas',
    name: 'PNB Overseas Worker Loan',
    type: 'Bank',
    tag: 'Mock regulated partner',
    interestRateAnnual: 10.9,
    processingFeePercent: 1.25,
    minAmount: 30000,
    maxAmount: 280000,
    tenures: [12, 24, 36],
    relaxationPeriodDays: 45,
    requiredDocuments: ['aadhaar', 'passport', 'contract'],
    processingTime: '4 working days',
  },
  {
    id: 'muthoot-migration',
    name: 'Muthoot Migration Loan',
    type: 'NBFC',
    tag: 'Prototype partner',
    interestRateAnnual: 14.0,
    processingFeePercent: 1.5,
    minAmount: 10000,
    maxAmount: 150000,
    tenures: [12, 18, 24],
    relaxationPeriodDays: 30,
    requiredDocuments: ['aadhaar', 'passport'],
    processingTime: 'Same day',
    badge: 'Fast approval',
  },
  {
    id: 'fintech-bridge',
    name: 'Bridge FinTech Migration',
    type: 'FinTech',
    tag: 'Integration-ready',
    interestRateAnnual: 12.5,
    processingFeePercent: 1.0,
    minAmount: 20000,
    maxAmount: 200000,
    tenures: [12, 24],
    relaxationPeriodDays: 60,
    requiredDocuments: ['aadhaar', 'passport', 'contract'],
    processingTime: '24 to 48 hours',
    badge: 'Lowest EMI',
  },
]

// ─── Insurance ────────────────────────────────────────────────────────────
export const INSURANCE_CATEGORIES = [
  { id: 'PBBY',          label: 'PBBY (Migrant Cover)', icon: '🇮🇳', mandatoryFor: 'ECR-category overseas workers',
    description: 'Pravasi Bharatiya Bima Yojana — government-mandated cover for ECR workers.' },
  { id: 'TRAVEL',        label: 'Travel Insurance',     icon: '🛫', description: 'Trip cancellation, baggage, medical evacuation overseas.' },
  { id: 'HEALTH',        label: 'Health Insurance',     icon: '🏥', description: 'Cashless hospitalisation in India and abroad.' },
  { id: 'LIFE',          label: 'Life Insurance',       icon: '👨‍👩‍👧', description: 'Long-term cover for your family while you work overseas.' },
  { id: 'FAMILY_HEALTH', label: 'Family Health',        icon: '👪', description: 'Covers spouse, children and parents in India.' },
  { id: 'CHILD_SAVINGS', label: 'Child Savings Plan',   icon: '🎒', description: 'Education-linked savings + life cover combo.' },
]

export const INSURANCE_PROVIDERS = [
  { id: 'pbby-govt',  name: 'PBBY (Govt. of India)',     type: 'Government-linked', tag: 'Mandatory cover',     claimHelpline: '+91 11 4078 8870' },
  { id: 'tata-aig',   name: 'Tata AIG',                  type: 'Insurer',           tag: 'Prototype partner',   claimHelpline: '+91 1800 266 7780' },
  { id: 'icici-lomb', name: 'ICICI Lombard',             type: 'Insurer',           tag: 'Prototype partner',   claimHelpline: '+91 1800 2666' },
  { id: 'star-hlth',  name: 'Star Health',               type: 'Insurer',           tag: 'Prototype partner',   claimHelpline: '+91 1800 425 2255' },
  { id: 'hdfc-ergo',  name: 'HDFC Ergo',                 type: 'Insurer',           tag: 'Prototype partner',   claimHelpline: '+91 1800 2700 700' },
  { id: 'reliance',   name: 'Reliance General',          type: 'Insurer',           tag: 'Integration-ready',   claimHelpline: '+91 1800 3009' },
]

export const INSURANCE_PLANS = [
  { id: 'pbby-2yr',          providerId: 'pbby-govt',  category: 'PBBY',          name: 'PBBY 2-year cover',           premium: 275,    frequency: 'one-time',
    coverageAmount: 1000000, benefits: ['Death/disability cover', 'Repatriation of mortal remains', 'Maternity (women workers)'], exclusions: ['Voluntary risk', 'War zones'], documents: ['Passport', 'Visa', 'Emigration clearance'], paymentMethods: ['UPI','NET_BANKING','BANK_BRANCH'], badge: 'Mandatory for ECR' },
  { id: 'tata-migrant-h+t',  providerId: 'tata-aig',   category: 'TRAVEL',        name: 'Migrant Travel + Health',     premium: 4800,   frequency: 'yearly',
    coverageAmount: 2000000, benefits: ['Hospitalisation', 'Trip cancellation', 'Document loss support', 'Repatriation'], exclusions: ['Pre-existing conditions', 'Adventure sports'], documents: ['Passport', 'Visa', 'Travel ticket'], paymentMethods: ['UPI','NET_BANKING'], badge: 'Recommended' },
  { id: 'icici-lomb-travel', providerId: 'icici-lomb', category: 'TRAVEL',        name: 'Lombard Worker Travel',       premium: 5200,   frequency: 'yearly',
    coverageAmount: 2500000, benefits: ['Hospital cashless', 'Personal accident', 'Family floater'], exclusions: ['Self-inflicted injury'], documents: ['Passport', 'Visa'], paymentMethods: ['UPI','NET_BANKING','BANK_BRANCH'] },
  { id: 'star-family',       providerId: 'star-hlth',  category: 'FAMILY_HEALTH', name: 'Star Family Health Optima',   premium: 12000,  frequency: 'yearly',
    coverageAmount: 500000,  benefits: ['Spouse', 'Children', 'Cashless 14k+ hospitals'], exclusions: ['Cosmetic surgery'], documents: ['Aadhaar', 'Family proof'], paymentMethods: ['UPI','NET_BANKING'], badge: 'Best for family' },
  { id: 'hdfc-life-term',    providerId: 'hdfc-ergo',  category: 'LIFE',          name: 'HDFC Term Plan',              premium: 8500,   frequency: 'yearly',
    coverageAmount: 5000000, benefits: ['Term cover', 'Accidental death rider'], exclusions: ['Suicide in 1st year'], documents: ['Aadhaar', 'PAN', 'Income proof'], paymentMethods: ['UPI','NET_BANKING','BANK_BRANCH'] },
  { id: 'reliance-child',    providerId: 'reliance',   category: 'CHILD_SAVINGS', name: 'Smart Future Child',          premium: 24000,  frequency: 'yearly',
    coverageAmount: 1500000, benefits: ['Education milestone payouts', 'Life cover for parent'], exclusions: ['Surrender before 5 yrs'], documents: ['Aadhaar', 'Birth certificate'], paymentMethods: ['UPI','NET_BANKING'] },
  { id: 'tata-aig-health',   providerId: 'tata-aig',   category: 'HEALTH',        name: 'Tata AIG Migrant Health',     premium: 6800,   frequency: 'yearly',
    coverageAmount: 1000000, benefits: ['Cashless network', 'Pre/post hospitalisation', 'Day-care procedures'], exclusions: ['First 30 days'], documents: ['Aadhaar'], paymentMethods: ['UPI','NET_BANKING','BANK_BRANCH'] },
]

// ─── Travel — airports + flight options ──────────────────────────────────
export const AIRPORTS = [
  { code: 'LKO', city: 'Lucknow',    country: 'India',        name: 'Chaudhary Charan Singh Intl' },
  { code: 'DEL', city: 'New Delhi',  country: 'India',        name: 'Indira Gandhi Intl' },
  { code: 'BOM', city: 'Mumbai',     country: 'India',        name: 'Chhatrapati Shivaji Intl' },
  { code: 'COK', city: 'Kochi',      country: 'India',        name: 'Cochin Intl' },
  { code: 'HYD', city: 'Hyderabad',  country: 'India',        name: 'Rajiv Gandhi Intl' },
  { code: 'BLR', city: 'Bengaluru',  country: 'India',        name: 'Kempegowda Intl' },
  { code: 'DXB', city: 'Dubai',      country: 'UAE',          name: 'Dubai Intl' },
  { code: 'AUH', city: 'Abu Dhabi',  country: 'UAE',          name: 'Zayed Intl' },
  { code: 'SHJ', city: 'Sharjah',    country: 'UAE',          name: 'Sharjah Intl' },
  { code: 'DOH', city: 'Doha',       country: 'Qatar',        name: 'Hamad Intl' },
  { code: 'RUH', city: 'Riyadh',     country: 'Saudi Arabia', name: 'King Khalid Intl' },
  { code: 'JED', city: 'Jeddah',     country: 'Saudi Arabia', name: 'King Abdulaziz Intl' },
  { code: 'KWI', city: 'Kuwait City',country: 'Kuwait',       name: 'Kuwait Intl' },
  { code: 'MCT', city: 'Muscat',     country: 'Oman',         name: 'Muscat Intl' },
]

export const FLIGHT_PROVIDERS = [
  { id: 'air-india', name: 'Air India',                       airline: 'Air India',  tag: 'Prototype partner' },
  { id: 'indigo',    name: 'IndiGo',                          airline: 'IndiGo',     tag: 'Prototype partner' },
  { id: 'flydubai',  name: 'flydubai',                        airline: 'flydubai',   tag: 'Prototype partner' },
  { id: 'emirates',  name: 'Emirates',                        airline: 'Emirates',   tag: 'Prototype partner' },
  { id: 'air-arabia',name: 'Air Arabia',                      airline: 'Air Arabia', tag: 'Prototype partner' },
  { id: 'sky-search',name: 'Skyscanner-style aggregator',     airline: 'Multi-airline', tag: 'Integration-ready' },
]

export const TRAVEL_PAYMENT_METHODS = [
  { id: 'upi',  label: 'UPI',           icon: '📲', note: 'Instant' },
  { id: 'emi',  label: 'EMI',           icon: '🪙', note: '3 / 6 / 12 months' },
  { id: 'bank', label: 'Bank transfer', icon: '🏦', note: '1 to 2 hours' },
]

// ─── Affiliated banks (for remittance bank-payout step) ───────────────────
export const AFFILIATED_PAYOUT_BANKS = [
  { id: 'sbi',   name: 'State Bank of India', supportsInstant: true,  ifscPrefix: 'SBIN', website: 'https://onlinesbi.sbi' },
  { id: 'hdfc',  name: 'HDFC Bank',           supportsInstant: true,  ifscPrefix: 'HDFC', website: 'https://hdfcbank.com' },
  { id: 'icici', name: 'ICICI Bank',          supportsInstant: true,  ifscPrefix: 'ICIC', website: 'https://icicibank.com' },
  { id: 'axis',  name: 'Axis Bank',           supportsInstant: true,  ifscPrefix: 'UTIB', website: 'https://axisbank.com' },
  { id: 'pnb',   name: 'Punjab National Bank',supportsInstant: false, ifscPrefix: 'PUNB', website: 'https://pnbindia.in' },
  { id: 'bob',   name: 'Bank of Baroda',      supportsInstant: false, ifscPrefix: 'BARB', website: 'https://bankofbaroda.in' },
  { id: 'fed',   name: 'Federal Bank',        supportsInstant: true,  ifscPrefix: 'FDRL', website: 'https://federalbank.co.in' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', supportsInstant: true,  ifscPrefix: 'KKBK', website: 'https://kotak.com' },
]

// ─── Cash pickup agents ──────────────────────────────────────────────────
export const CASH_PICKUP_AGENTS = [
  { id: 'wu-hzg',  name: 'Western Union — Hazratganj',  city: 'Lucknow', address: 'Shop 12, Hazratganj Plaza',      contact: '+91 522 4001 234', hours: 'Mon–Sat 9 AM – 8 PM',  documents: ['Govt. ID', 'Transfer code'] },
  { id: 'mg-amn',  name: 'MoneyGram — Aminabad',        city: 'Lucknow', address: 'GF, Aminabad Bazaar',            contact: '+91 522 4002 567', hours: 'Mon–Sat 10 AM – 7 PM', documents: ['Govt. ID', 'Transfer code'] },
  { id: 'ip-llb',  name: 'India Post — Lalbagh',        city: 'Lucknow', address: 'India Post Office, Lalbagh',     contact: '+91 522 2620 110', hours: 'Mon–Fri 9 AM – 5 PM',  documents: ['Govt. ID', 'Transfer code'] },
  { id: 'wu-ksm',  name: 'Western Union — Kashmere Gate',city: 'Delhi',   address: 'Kashmere Gate, Old Delhi',       contact: '+91 11 2393 4567', hours: 'Mon–Sat 9 AM – 9 PM',  documents: ['Govt. ID', 'Transfer code'] },
  { id: 'mg-bkc',  name: 'MoneyGram — BKC',             city: 'Mumbai',  address: 'Bandra Kurla Complex',           contact: '+91 22 6789 0123', hours: 'Mon–Sun 9 AM – 9 PM',  documents: ['Govt. ID', 'Transfer code'] },
]
