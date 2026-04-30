# Pravasi Setu — Dev Log

## 2026-04-30 — Design system migration + remittance flow upgrade

### Design system
- Replaced teal/green primary with SwiftChat blue (`#386AF6`) by repointing
  Tailwind primitive tokens. Every existing `bg-primary` / `text-primary`
  reskinned automatically.
- Added [src/styles/tokens.css](../src/styles/tokens.css) — semantic CSS
  variables for background / text / border / interactive / status / chat.
- Added [src/styles/theme.css](../src/styles/theme.css) — Mukta + Noto Sans
  font imports, typography utility classes (Title/Large, Title/Medium, etc.).
- Updated `tailwind.config.js` to expose the SwiftChat radius scale
  (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`pill`/`full`), card / modal / focus shadows,
  Mukta font family, and a richer status palette.
- Added shared components: `Button`, `Input`, `Card`, `StatusChip`, `Stepper`,
  `Timeline`, `AlertBanner`, `PartnerStrip`.

### Branding
- `public/favicon.png` is now the ConveGenius square logo.
- `public/nsdc.png` added; partner strips appear on Splash, KYC, Skill
  Passport, Certificate Verification, and the Remittance summary panel.
- `Logo.jsx` mark recoloured to SwiftChat blue gradient.

### Remittance flow (Western Union / Wise / Remitly-style)
- Rebuilt [src/pages/RemittancePage.jsx](../src/pages/RemittancePage.jsx) as a
  6-step stepper plus confirmation:
  Quote → Method → Recipient → KYC → Pay → Review → Done.
- Sticky summary panel on tablet/desktop showing recipient gets / fee / FX rate
  / method, plus a trust-and-safety card.
- Added `RECIPIENTS`, `PAYOUT_METHODS`, `FUNDING_METHODS`, `SOURCE_COUNTRIES`,
  `TRANSFER_PURPOSES`, `RATE_ALERTS`, `TRANSFER_SUPPORT_TICKETS`,
  `TRANSFER_STATUSES` to `src/data/mockData.js`.
- Expanded `REMITTANCE_PROVIDERS` to 8 (Wise, Western Union, Remitly,
  MoneyGram, WorldRemit, SBI, ICICI, NPCI UPI Foreign Inward) with prototype-
  safe labels (`Prototype partner`, `Mock regulated partner`,
  `Integration-ready`).
- Updated existing transfers to the full status enum and added an exception
  example (`TR-9755`, cash pickup expired → refund initiated).
- Rebuilt [TransferTrackerPage](../src/pages/TransferTrackerPage.jsx) with
  status chip mapping, Timeline component (success / current / exception),
  and quick actions: receipt / share / notify / call provider / send-again /
  raise dispute.
- ChatPage intents extended for: send to UPI, send to bank, cash pickup,
  cheapest way, track delayed transfer, download receipt, notify receiver,
  set rate alert.

### Docs added
- [DESIGN_SYSTEM_IMPLEMENTATION.md](DESIGN_SYSTEM_IMPLEMENTATION.md)
- [REMITTANCE_FLOW.md](REMITTANCE_FLOW.md)
- [PROTOTYPE_GAP_ANALYSIS.md](PROTOTYPE_GAP_ANALYSIS.md)
- [REQUIREMENT_TRACEABILITY_MATRIX.md](REQUIREMENT_TRACEABILITY_MATRIX.md)

---

## 2026-04-30 (later) — UI responsiveness + validation audit

### Layout helpers
- Added [src/components/PageShell.jsx](../src/components/PageShell.jsx) with
  `size="form" | "content" | "wide"` (560 / 768 / 1280px caps).
- Added [src/components/FormShell.jsx](../src/components/FormShell.jsx) — 640px
  cap for sub-flows / modal-style screens.
- Made [KYCPage `FlowShell`](../src/pages/KYCPage.jsx) cap inner content at
  640px so Aadhaar eKYC / DigiLocker / APAAR forms stop sprawling on desktop.

### Page-level fixes
- **PreDeparturePage** — replaced `aspect-square` `ServiceTile` with compact
  cards (`min-h-[88-96px]`, `line-clamp-2` label). Grid now
  `grid-cols-3 md:grid-cols-4 lg:grid-cols-4`. Header content capped to
  `max-w-screen-lg`. Progress bar uses white-on-blue.
- **RemittancePage** — blue stepper band content capped to
  `max-w-screen-xl`.
- **EmergencyAssistancePage** — hero content, scenario grid
  (`md:3 lg:4`), hotline cards (`lg:2-col`) and inner sections all wrapped
  in `max-w-screen-xl`.
- **HomePage** — orange/yellow "Safe Migration" gradient replaced with
  `from-primary to-primary-dark` blue gradient + white pill CTA. Quick
  Services grid restyled: fixed-height cards (`h-[120px] sm:h-[136px]`),
  centered icon + label using `flex-col items-center justify-center`,
  `line-clamp-2`, hover lift, responsive `grid-cols-3 sm:grid-cols-4 lg:grid-cols-6`.
- **ProfilePage** — every section wrapped in a unified `Section` card
  (`rounded-3xl shadow-card`, `divide-y` row separators, larger 9px icon
  bubbles). Avatar block raised to `rounded-2xl` with shadow-modal. Footer
  copy cleaned up.
- **GrievancePage** — header CTA row capped to `max-w-screen-md`; create
  flow body wrapped in the same container.

### Validation
- Added [src/utils/validation.js](../src/utils/validation.js):
  `isRequired`, `isValidIndianPhone`, `isValidAadhaar`, `maskAadhaar`,
  `isValidOTP`, `isValidCaptcha`, `isValidAge`, `isValidDOB`, `getAgeFromDOB`,
  `isAdult`, `isReasonableWorkingAge`, `isValidName`, `isValidLocation`,
  `isValidSalary`, `isValidIFSC`, `isValidUPI`, `isValidBankAccount`,
  `isValidDescription`, `validateForm`.
- **LoginPage** — phone input uses `isValidIndianPhone`; inline error +
  red border + disabled CTA + tap-disabled-CTA reveals errors.
- **KYCPage Aadhaar sub-flow** — Aadhaar dummy-value rejection
  (`000000000000` etc.), captcha case-insensitive match,
  consent-required block, OTP 6-digit. Errors render inline; submit
  disabled until valid.
- **ProfileSetupPage** — Step 0 now requires DOB (auto-calculates age,
  age field becomes read-only). Validators: name (letters/2+),
  phone (Indian 10-digit), DOB (≥18), location (3+). Inline errors only
  after blur or after pressing Next.
- **GrievancePage** — category required + 20-character description (or
  voice note). Submit disabled until satisfied; emergency button stays
  one-tap.

### Acceptance
- `npm run build` succeeds.
- No green/teal as brand color anywhere; semantic green retained for
  verified / completed / success states only.
- Auth pages capped at 560px, KYC sub-flows at 640px.

---

## 2026-04-30 (final pass) — Session persistence + wide-screen audit

### Persistence layer
- New [src/utils/storage.js](../src/utils/storage.js) with namespaced keys:
  `pravasi_session / _profile / _app_state / _language / _applications /
  _transfers / _tickets / _certificates / _checklist`. All reads use
  `safeJsonParse`; all writes are wrapped in try/catch (quota safe). Marked
  with a "prototype-only local persistence — replace with secure backend in
  production" disclaimer.
- [AppContext.jsx](../src/context/AppContext.jsx) now hydrates every slice
  lazily from storage with `useState(() => loadX() ?? default)` and
  persists each one through a `useEffect`. Added `session` slice with
  `isAuthenticated`, `hasCompletedOnboarding`, `kycStatus`, `createdAt`.
- New context actions: `signIn(opts)`, `completeKYC()`, `signOut()`.
  `signOut` clears the session + every user-generated slice and routes to
  `login` (language is preserved across sessions).
- Initial screen picker: if authenticated and `lastRoute` is not a transient
  auth route (`splash/login/otp/kyc`), restore it; otherwise go to `home`.
  No session → `login` if a language is already chosen, else `splash`.

### Auth wiring
- LoginPage: phone-valid Send OTP → `signIn({ kycStatus: 'pending' })` then
  navigate to OTP. "Login with Aadhaar / DigiLocker" button also signs in
  before routing to KYC.
- OTPPage: filling all 6 digits → `signIn({ kycStatus: 'pending' })` →
  navigate to KYC.
- KYCPage: "Continue to App" → `completeKYC()` (`kycStatus: 'verified'`) →
  home. "Skip for now" → `signIn({ hasCompletedOnboarding: true })`.
- ProfilePage: Sign Out wired to `signOut()`.

### Routes that persist now
After refresh on any non-auth screen, the user lands back on the same
screen (params included). Examples verified: `transferTracker?transferId=`,
`applicationTracker?applicationId=`, `ticketDetail?ticketId=`,
`certificate?certId=`, `employerProfile?employerId=`.

### Wide-screen audit (final pass)
- **SkillPassport** rewrites: hero card capped at `max-w-screen-lg`,
  body promoted to a 2-column md grid (Skills + Certifications),
  Work Experience uses 2-col on `sm`, "Generate Resume PDF" CTA capped to
  `min-w-[280px]` instead of stretching, every card is now
  `rounded-2xl shadow-card border border-bdr-light`.
- **ReturnPage** orange hero replaced with `from-primary to-primary-dark`
  blue gradient + RotateCcw chip. Steps render as a 2-column grid on
  desktop with `rounded-2xl`, hover-lift, and chevron-aligned rows. Skill
  reuse mapping moved into its own polished card with a "View Skill
  Passport" link.
- **EmploymentPage** salary header uses blue gradient + capped content.
  Page body uses `max-w-screen-xl mx-auto`. Quick action tiles use
  `rounded-2xl`. Salary slips + Earnings trend now sit side-by-side on
  `lg+` (master/detail).
- **PreDeparturePage** restructured into three labelled sections
  ("Services before departure" / "Departure checklist" /
  "Legal Toolkit + Language"). Service tiles wrap an emoji in a coloured
  bubble inside a `rounded-2xl` card with hover lift; the grid is now 3-up
  on mobile and 4-5-up on tablet/desktop. Checklist groups use a 2-column
  grid on `md+`. Legal + Language sit side-by-side; Language card upgraded
  to a primary CTA.

### Acceptance
- `npm run build` ✓
- Refresh on any non-auth route restores it; auth state survives reload.
- Sign Out wipes user data, returns to Login.
- No content card stretches edge-to-edge on desktop.
- No orange/teal as brand color; semantic green only for completed.

---

## 2026-04-30 (financial services sprint)

Added the **Financial & Mobility Services layer** per
[PRAVASI_New_Features_Product_Spec.md](../PRAVASI_New_Features_Product_Spec.md).
See [FINANCIAL_SERVICES_FLOW.md](FINANCIAL_SERVICES_FLOW.md) for the
detailed acceptance breakdown.

### New pages
- [LoansPage.jsx](../src/pages/LoansPage.jsx) — Need builder → docs →
  provider compare → consent → submit → tracker. Routes: `loans`,
  `loans?loanId=…` (detail), `loans?mode=list` (My Loans).
- [InsurancePage.jsx](../src/pages/InsurancePage.jsx) — Marketplace
  with Insurance / Claims / Complaint / Talk-to-someone tabs, plan
  comparison, plan detail, payment, policy detail. Routes: `insurance`,
  `insurance?policyId=…`, `insurance?mode=list`, `insurance?category=PBBY`.
- [TravelPage.jsx](../src/pages/TravelPage.jsx) — Search → flight options
  → passenger → payment → confirmation, with deterministic mock flight
  generation, mock PNR, and T-3/T-1 day reminders saved on the booking.
  Routes: `travel`, `travel?bookingId=…`, `travel?mode=list`.
- [JobApplyChoicePage.jsx](../src/pages/JobApplyChoicePage.jsx) — Swift
  Apply (verified profile) vs Manual entry. JobDetailPage Apply Now CTA
  now routes here. Manual submissions are saved to both `applications`
  (so they appear in the existing tracker) and `manualApplications` (for
  audit / re-review).

### Data + utils
- mockData.js extended with `LOAN_NEED_CATEGORIES`, `LOAN_DOCUMENTS`,
  `LOAN_PROVIDERS`, `INSURANCE_CATEGORIES`, `INSURANCE_PROVIDERS`,
  `INSURANCE_PLANS`, `AIRPORTS`, `FLIGHT_PROVIDERS`,
  `TRAVEL_PAYMENT_METHODS`, `AFFILIATED_PAYOUT_BANKS`,
  `CASH_PICKUP_AGENTS`.
- New [src/utils/financeCalculations.js](../src/utils/financeCalculations.js)
  with `calculateEMI`, `totalPayable`, `totalInterest`, `emiAffordability`,
  `formatINR`.

### AppContext + storage
- 5 new persisted slices with hydration, save-on-change `useEffect`s, and
  matching mutators: `loanApplications`, `insurancePolicies`,
  `travelBookings`, `manualApplications`, `beneficiaries`. All five keys
  added to `STORAGE_KEYS` and wiped by `clearSession()` / `signOut()`.

### Cross-page wiring
- **PreDeparture** service tiles now navigate: Loans → `loans`,
  Insurance (PBBY) → `insurance?category=PBBY`, Forex → `remittance`,
  Tickets → `travel`. Toast-only stubs remain only for vaccines / visa /
  contract review.
- **Profile** gained a "My Services" section with My Loans / My Insurance /
  My Travel Tickets / My Transfers / My Beneficiaries / My Applications,
  showing live counts from context.
- **HomePage** quick tiles now include Loans / Insurance / Travel.
- **JobDetail** Apply Now now routes to `jobApplyChoice` with `jobId`.
- **ChatPage** intents extended for migration loan, EMI, loan status,
  loan documents, buy/get insurance, PBBY, insurance claim, my insurance,
  book/find flight, my ticket, travel reminder, Swift Apply, manual
  application, eMigrate verified jobs.

### Remittance enhancements
- `HelpCircle` action in TopBar opens a "How to send money" drawer with
  the 5-step process, fraud/recipient/refund warnings, and prototype
  partner disclosure.
- Bank-payout recipient step lists the 8 affiliated banks as
  hyperlink-style chips with instant-credit indicators.
- Cash-payout recipient step shows agent cards (name, address, contact,
  hours, document requirements) filtered by pickup city.

### i18n note
The spec asked to update `src/i18n/translations/{en,hi,ml,ta,bn,or}.json`,
but no `src/i18n` folder currently exists in the prototype. New strings
are literal English (matching every other page in the codebase). Adding
i18n is a separate sprint.

---

## 2026-04-30 (resume builder sprint)

Promoted the Skill Passport from a static card list into an editable
resume workspace with a downloadable A4 PDF. Detailed acceptance breakdown
in [RESUME_BUILDER_FLOW.md](RESUME_BUILDER_FLOW.md).

### New
- [src/pages/ResumeBuilderPage.jsx](../src/pages/ResumeBuilderPage.jsx) —
  multi-section editor (personal, summary, skills, certifications,
  experience, education, languages, documents, references) + 3-template
  selector + live A4 preview + browser print-to-PDF (no extra deps).
  Mobile uses Edit / Preview / Download tabs; desktop uses 5-col grid
  with sticky preview.
- `resume` slice in AppContext with `setResume(updater)` action that
  bumps `lastUpdated`. Persisted under `pravasi_resume_data`.
- Seed helper `buildResumeFromProfile(profile)` so first-time users see
  a populated resume from existing skills / certs / experience.
- Six i18n JSON skeletons under `src/i18n/translations/` covering the
  resume keys requested by the spec (runtime provider not yet wired —
  documented as a follow-up).

### Updates
- **SkillPassportPage** header now offers Edit / Share / Download
  actions; the hero card has a 4th "Readiness" stat with a progress bar;
  the bottom CTA pair is `Edit Passport` (outline) + `Open Resume
  Builder` (primary). Sub-title shows last-updated relative time.
- **ProfilePage** — Resume Builder row now navigates to `resumeBuilder`
  with a "Last updated …" sub-line.
- **JobApplyChoicePage** — Swift Apply card uses the resume slice for
  completeness (falls back to profile if absent). When readiness < 60 %,
  a checklist + "Open Resume Builder" CTA appears. Same checklist also
  surfaces inside the Swift Apply Review step.
- **ChatPage** — 9 new intents covering create / download / edit resume,
  add education / experience / certificate, show skill passport, share
  profile, apply with resume.
- **App.jsx** — new `resumeBuilder` route.

### PDF approach
`window.print()` with print-only CSS that hides everything except a
hidden `#resume-print-root`. `document.title` is swapped to
`Pravasi_Setu_Resume_<name>` before printing so the browser's "Save as
PDF" dialog suggests that filename. Zero added dependencies.

### Acceptance
- `npm run build` ✓
- Resume Builder editor + preview + PDF download ✓
- Resume data persists across refresh ✓
- Skill Passport linked to Resume Builder + has interactive header ✓
- Profile → Resume Builder ✓
- Swift Apply uses resume readiness + checklist ✓
- Chatbot can open resume actions ✓
- Blue `#386AF6` primary CTA preserved; green only for verified;
  amber only for pending ✓

---

## 2026-04-30 (resume PDF pagination fix)

The earlier sprint shipped resume-PDF generation via `window.print()` but
content longer than one A4 page was being clipped at the page break and
the footer overlapped content. This sprint replaces the single-`<div>`
print root with a content-aware paginated document.

### Changes
- New helpers in [ResumeBuilderPage.jsx](../src/pages/ResumeBuilderPage.jsx):
  `buildResumeSections`, `bulletsOf`, `estimateItemHeight`,
  `estimateSummaryHeight`, `estimateSkillsHeight`, `paginateResume`.
- New components: `ResumePrintDocument`, `ResumePrintPage`,
  `MainResumeHeader`, `ContinuationHeader`, `ResumeFooter`,
  `ResumePrintSection`, plus per-section blocks
  (`SummaryBlock` / `SkillsBlock` / `ExperienceBlock` /
  `CertificationsBlock` / `EducationBlock` / `LanguagesBlock` /
  `DocumentsBlock` / `ReferencesBlock`).
- Live preview now shows page count next to the "Live preview · A4"
  label and stacks pages with vertical gaps.
- `onPrint` toggles `body.printing-resume` and listens for `afterprint`
  / `focus` to clean up + restore document title.
- `PrintStyles` rewritten with `@page { size: A4; margin: 0 }`, the
  `body.printing-resume` isolation pattern, exact A4 frames with
  `page-break-after: always`, `break-inside: avoid` on sections / entries
  / chip rows, an anti-orphan rule on section headings, and an absolutely-
  positioned per-page footer pinned at `bottom: 8mm`.
- Legacy `ResumePreview` and `ResumePreviewLegacy_KEEP_FOR_REF` removed
  (the new paginated doc is used in both screen and print roots).

### Acceptance
- `npm run build` ✓
- Multi-page A4 output with continuation headers + Page X of Y footers.
- No section heading orphaned at the bottom of a page.
- Work experience / certificates / education / references never split
  mid-item.
- Browser print output contains only the resume (no app chrome).
- Live preview still works and accurately shows the page count.
- Existing editor features unchanged.

---

## 2026-04-30 (resume PDF parity + back-button audit)

The earlier paginated-PDF sprint shipped multi-page output but the
preview and print versions used different content frames — preview used
`aspect-ratio: 210/297` with smaller padding, while print used real
`210mm`. That broke parity: a resume that showed 2 pages in the preview
could compress to a single A4 sheet in the printed PDF. This sprint
fixes the parity bug and audits all back buttons.

### Resume parity (preview ↔ export)
- New canonical constants in
  [ResumeBuilderPage.jsx](../src/pages/ResumeBuilderPage.jsx):
  `A4_PAGE_WIDTH_MM = 210`, `A4_PAGE_HEIGHT_MM = 297`,
  `PAGE_PADDING_*_MM = 14 / 14 / 18`.
- `ResumePrintPage` rewritten to render at the canonical A4 dimensions
  in **both** screen and print contexts. The `screenMode` prop has been
  removed entirely.
- New `<ResumeScreenPreview>` wrapper measures the editor preview panel
  with `ResizeObserver`, computes a scale factor (`available / 793.7px`
  clamped to 0.32–0.85), applies it via `transform: scale()` on a
  wrapper, and reserves the scaled height in the layout so the panel
  doesn't collapse around an absolutely-positioned stack.
- `PrintStyles` rewritten with strict, non-overrideable rules:
  - `body, html { width: 210mm; print-color-adjust: exact }`
  - `#resume-print-root { position: static !important; transform: none !important; zoom: 1 !important }`
  - `.resume-print-page { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; overflow: hidden !important; page-break-after: always !important }`
    The hard `height: 297mm` (instead of `min-height`) is the critical
    fix — it stops the browser from auto-fitting multiple pages onto a
    single sheet.
- `onPrint` now waits two `requestAnimationFrame` ticks before printing,
  then queries the DOM for `#resume-print-root .resume-print-page` count.
  If the count drifts from the preview's `pages.length` it logs a
  console warning so future regressions surface immediately. Toast also
  hints "turn off browser headers in the print dialog" for the cleanest
  PDF.

### Back-button audit
- Added a `BACK_FALLBACKS` map in
  [AppContext.jsx](../src/context/AppContext.jsx) covering every deep
  route: `resumeBuilder → passport`, `certificate → passport`,
  `jobDetail → jobs`, `jobApplyChoice → jobDetail`,
  `transferTracker → remittance`, `ticketDetail → grievance`,
  `loans/insurance/travel → predeparture`, `employment/return → home`,
  etc.
- `goBack()` updated: when the navigation stack has only the current
  route (e.g. user landed here via session restore or a chat deep-link),
  it falls back to the mapped route instead of doing nothing. `params`
  are reset on every back so a stale `transferId`/`loanId` doesn't
  reappear.

### Acceptance
- `npm run build` ✓
- Preview shows N pages → print/export shows N pages (verified via the
  rAF + DOM-count check).
- `.resume-print-page` is hard-locked at `height: 297mm` with
  `overflow: hidden` — the browser cannot fit-to-page.
- Back buttons recover gracefully on every deep page after refresh.
