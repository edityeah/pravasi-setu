# Pravasi Setu Prototype — Gap Analysis

Tracks what is implemented in the React/Vite prototype vs. the BRD and the
remittance research brief. **Everything is mock/prototype-safe** — no real
financial, banking, or government integrations are claimed.

## BRD coverage

| BRD module                          | State        | Where                                                                      |
|------------------------------------ |--------------|----------------------------------------------------------------------------|
| Onboarding + profile creation       | ✓ Done       | SplashPage, LoginPage, OTPPage, KYCPage, **ProfileSetupPage** (5 steps)    |
| Skill passport                      | ✓ Done       | SkillPassportPage with NSDC partner strip                                  |
| Certificate verification            | ✓ Done       | CertificateVerificationPage with verifier authority + on-chain hash UI     |
| Job discovery (dataset-backed)      | ✓ Done       | JobsPage — 100 records derived from `migrant_jobs_dataset.xlsx`           |
| Employer profile + ratings          | ✓ Done       | EmployerProfilePage with compliance flags                                  |
| Application tracking                | ✓ Done       | ApplicationTrackerPage list + detail w/ 5-step pipeline                    |
| Migration cost calculator           | ✓ Done       | CalculatorPage with master/detail layout on desktop                        |
| Pre-departure checklist             | ✓ Done       | PreDeparturePage + service partner tiles                                   |
| Post-arrival support                | ✓ Done       | PostArrivalPage                                                            |
| **Remittance flow** (Western Union-style) | ✓ Done | RemittancePage — Quote → Method → Recipient → KYC → Funding → Review → Confirm |
| Transfer tracking                   | ✓ Done       | TransferTrackerPage with full status enum + exception banner               |
| Grievance system                    | ✓ Done       | GrievancePage + TicketDetailPage with embassy/MEA/legal routing            |
| Emergency assistance                | ✓ Done       | EmergencyAssistancePage with SOS, hotlines, scenario buttons               |
| Return & reintegration              | ✓ Done       | ReturnPage with NSDC-mapping cards                                          |
| Multilingual chatbot                | ✓ Done       | ChatPage with 40+ intents covering BRD + remittance prompts                |
| Trust badges / partner logos        | ✓ Done       | PartnerStrip on Splash / KYC / Passport / Certificate / Remittance         |

## Remittance research-doc coverage

| Spec area              | State        | Notes                                                                  |
|------------------------|--------------|------------------------------------------------------------------------|
| Quote-first flow       | ✓ Done       | Step 1 leads with rate/fee/recipient-gets summary                      |
| Provider compare       | ✓ Done       | 8 providers (WU, Wise, Remitly, MoneyGram, WorldRemit, SBI, ICICI, NPCI UPI) |
| Delivery methods       | ✓ Done       | UPI, Bank account, Cash pickup with ETA + fee% + description           |
| Recipient forms        | ✓ Done       | Dynamic form per method; saved recipients chips; purpose dropdown      |
| KYC simulation         | ✓ Done       | "Already verified" view with sender details + high-value notice        |
| Funding methods        | ✓ Done       | Debit, credit, bank transfer, Apple/Google Pay, agent                  |
| Review screen          | ✓ Done       | Full breakdown + fraud warning + refund policy banner                  |
| Confirmation           | ✓ Done       | Transfer ID, track, share, notify, save recipient, send-again, rate alert |
| Status enum            | ✓ Done       | All 16 states from §12.3 mapped to chip tone                          |
| Exception states       | ✓ Done       | Cash-pickup expired, refund-initiated banner; failed/cancelled chips    |
| Trust copy             | ✓ Done       | Recipient warning, fraud warning, KYC prompt, refund-policy banner     |
| Chat-first initiation  | ✓ Done       | Chatbot intents for send / track / cheapest / UPI / bank / cash / alert |

## Out of scope (prototype-safe)

- No real RBI / FEMA / MTSS / RDA registrations.
- No real banking, NPCI, exchange-house, or KYC partner APIs.
- Provider rates and fees are illustrative — labelled accordingly.
- Cards/Apple Pay/Google Pay UIs are visual stubs only — no payment SDK.

## UI Responsiveness + Validation Audit (2026-04-30 later)

| Concern                                        | Status | Where                                                                |
|------------------------------------------------|--------|----------------------------------------------------------------------|
| Auth/onboarding pages capped at 560px          | ✓ Done | Splash / Login / OTP / KYC / ProfileSetup via `AuthShell` / max-w    |
| Aadhaar eKYC sub-flow capped at 640px          | ✓ Done | `FlowShell` in `KYCPage`                                             |
| Remittance stepper content capped              | ✓ Done | RemittancePage stepper band uses `max-w-screen-xl`                   |
| Emergency hero + grid + hotlines constrained   | ✓ Done | EmergencyAssistancePage `max-w-screen-xl`, responsive 2/3/4 grids    |
| PreDeparture giant tiles → compact cards       | ✓ Done | `ServiceTile` redesign + `md:grid-cols-4`                            |
| Home Quick Services centered + responsive      | ✓ Done | Fixed-height cards, `flex-col items-center justify-center`           |
| Home Safe Migration card no longer orange      | ✓ Done | `from-primary to-primary-dark` gradient                              |
| Profile page polished cards + spacing          | ✓ Done | Unified `Section` w/ `rounded-3xl`, `divide-y` rows                  |
| Grievance header content capped                | ✓ Done | `max-w-screen-md`                                                    |
| Phone validation                                | ✓ Done | `isValidIndianPhone` in LoginPage + ProfileSetup                     |
| Aadhaar / captcha / consent validation          | ✓ Done | KYCPage Aadhaar flow (rejects dummy values, case-insensitive captcha)|
| OTP 6-digit validation helper                   | ✓ Done | `isValidOTP` in `validation.js` (reused on demand)                   |
| DOB-driven age + 18+ gate                       | ✓ Done | ProfileSetup Step 0 with auto-age + `isValidDOB`                     |
| Location / name validation                      | ✓ Done | ProfileSetup with inline errors                                       |
| Grievance category + 20-char description gate   | ✓ Done | GrievancePage create-flow                                            |
| Remittance UPI / IFSC / account validation      | ✓ Done | RemittancePage `RecipientStep` (existing regex)                      |
| No primary UI uses green/teal as brand          | ✓ Done | Audit run — only `bg-ok` / `text-ok` for semantic success            |
| Blue `#386AF6` remains the main CTA             | ✓ Done | Buttons / focus / progress bars / selected states                    |

### Known limitations
- Validation is intentionally light-touch (UI prototype, not a regulated
  flow). Production must replace `validation.js` with server-side
  rules + verified bank/UPI/Aadhaar APIs.
- Mukta / Noto Sans Indic fonts load from Google Fonts at runtime; offline
  builds need to vendor them.
- localStorage-based persistence is prototype-grade only. Production must
  use a real session/auth provider + server-backed user data, with
  encryption-at-rest and audit logging.
- Resume PDF uses browser `window.print()` (zero deps). Production should
  swap to a server-side PDF render for predictable typography/pagination.
- i18n JSON files exist but the runtime translator is not wired yet —
  new strings are literal English. Wiring `useTranslation` is a separate
  sprint.

## Session Persistence + Wide-screen Audit (final pass)

| Concern                                              | Status | Where                                          |
|------------------------------------------------------|--------|------------------------------------------------|
| Login persists across refresh                         | ✓ Done | `AppContext.session` + `pravasi_session`      |
| Last route restored on refresh                        | ✓ Done | `pravasi_app_state` + `pickInitialScreen`     |
| Profile / applications / transfers / tickets persist | ✓ Done | Each slice has its own storage key             |
| Certificates persist                                  | ✓ Done | `pravasi_certificates`                        |
| Pre-Departure checklist progress persists             | ✓ Done | `pravasi_checklist`                           |
| Selected language persists                            | ✓ Done | `pravasi_language`                            |
| Sign Out clears session + user data                   | ✓ Done | `signOut()` in AppContext                     |
| KYC completion flag                                   | ✓ Done | `completeKYC()` sets `kycStatus: 'verified'`  |
| SkillPassport constrained + polished                  | ✓ Done | `max-w-screen-lg`, 2-col md grid, rounded-2xl |
| Return page no orange decoration                      | ✓ Done | Blue gradient hero, 2-col steps grid          |
| Employment header + lists constrained                 | ✓ Done | `max-w-screen-xl`, master/detail on lg        |
| Pre-Departure premium polish                          | ✓ Done | Section titles, rounded-2xl, hover lift       |
| All headers cap inner content                         | ✓ Done | Audit complete; no edge-to-edge content       |

## Resume Builder + Skill Passport (sprint)

| Concern | Status | Where |
|---------|--------|-------|
| Skill Passport interactive (Edit / Share / Download header) | ✓ Done | SkillPassportPage TopBar + bottom CTA pair |
| ResumeBuilderPage with sectioned editor                     | ✓ Done | [ResumeBuilderPage.jsx](../src/pages/ResumeBuilderPage.jsx) |
| Personal / summary / skills / certs / experience / edu / languages / docs / references | ✓ Done | All 9 SectionCards in ResumeBuilderPage |
| Live A4 preview                                             | ✓ Done | `ResumePreview` component, sticky on `lg+` |
| 3 templates (clean / passport / overseas)                   | ✓ Done | `TEMPLATES` array; preview switches header + sections |
| Downloadable PDF                                            | ✓ Done | print-to-PDF with `Pravasi_Setu_Resume_<name>` filename |
| Resume data persists (`pravasi_resume_data`)                | ✓ Done | `setResume` + AppContext useEffect |
| Profile completeness / readiness score                      | ✓ Done | Same heuristic on Resume Builder, Skill Passport, Swift Apply |
| Swift Apply uses resume readiness + checklist               | ✓ Done | Low-readiness banner + "Complete resume" CTA |
| Chatbot resume intents                                      | ✓ Done | 9 new intents in ChatPage |
| i18n JSON skeletons (en/hi/ml/ta/bn/or)                     | ✓ Done | `src/i18n/translations/` (runtime not wired yet) |
