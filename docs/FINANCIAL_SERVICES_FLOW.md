# Financial & Mobility Services — Implementation Notes

This sprint added a **Financial & Mobility Services layer** on top of the
existing BRD flows. Source spec: [PRAVASI_New_Features_Product_Spec.md](../PRAVASI_New_Features_Product_Spec.md).

All providers, banks, insurers, recruiters, and travel partners are
**mock/prototype-safe** and are clearly tagged in the data with one of:
`Prototype partner` / `Mock regulated partner` / `Integration-ready` /
`Mandatory cover`. There is no live integration with banks, NBFCs,
insurers, IRDAI, RBI, NPCI, eMigrate, IATA, or any airline/booking API.

## What was added

| Feature | Page | Persisted slice (storage key) |
|---------|------|------------------------------|
| Loans (need builder → compare → submit → tracker) | [LoansPage.jsx](../src/pages/LoansPage.jsx) | `pravasi_loan_applications` |
| Insurance marketplace (categories → plans → pay → tracker, plus claims/complaint/support tabs) | [InsurancePage.jsx](../src/pages/InsurancePage.jsx) | `pravasi_insurance_policies` |
| Travel booking (search → options → passenger → pay → confirmation, plus reminders) | [TravelPage.jsx](../src/pages/TravelPage.jsx) | `pravasi_travel_bookings` |
| Job apply choice (Swift Apply vs Manual) | [JobApplyChoicePage.jsx](../src/pages/JobApplyChoicePage.jsx) | `pravasi_applications` (Swift) + `pravasi_manual_applications` (Manual) |
| Beneficiaries (saved recipients) | RemittancePage existing flow | `pravasi_beneficiaries` |
| Affiliated banks list + cash agents detail | RemittancePage Recipient step | — |
| "How to send money" trust drawer | RemittancePage TopBar action | — |

Routes registered in [App.jsx](../src/App.jsx): `loans`, `insurance`,
`travel`, `jobApplyChoice`. Each accepts params for sub-views:
`loans?loanId=…` and `loans?mode=list`, `insurance?policyId=…`,
`insurance?mode=list`, `insurance?category=PBBY`, `travel?bookingId=…`,
`travel?mode=list`, `travel?from=&to=`, `jobApplyChoice?jobId=…`.

## Routing entry points

- **Home** quick tiles: Loans, Insurance, Travel, plus existing Send Money.
- **PreDeparture** service tiles: Loans → `loans`, Insurance (PBBY) →
  `insurance?category=PBBY`, Forex → `remittance`, Tickets → `travel`.
- **Profile → My Services**: My Loans, My Insurance, My Travel Tickets,
  My Transfers, My Beneficiaries, My Applications.
- **JobDetail Apply Now**: opens `jobApplyChoice` with the selected
  `jobId`, then user picks Swift Apply or Manual.
- **Chatbot**: 12+ new intents covering loans, EMI, insurance, PBBY,
  travel, Swift Apply, manual application, eMigrate verified jobs.

## Data files

- [src/data/mockData.js](../src/data/mockData.js) — appended:
  `LOAN_NEED_CATEGORIES`, `LOAN_DOCUMENTS`, `LOAN_PROVIDERS`,
  `INSURANCE_CATEGORIES`, `INSURANCE_PROVIDERS`, `INSURANCE_PLANS`,
  `AIRPORTS`, `FLIGHT_PROVIDERS`, `TRAVEL_PAYMENT_METHODS`,
  `AFFILIATED_PAYOUT_BANKS`, `CASH_PICKUP_AGENTS`.
- [src/utils/financeCalculations.js](../src/utils/financeCalculations.js) —
  `calculateEMI`, `totalPayable`, `totalInterest`, `emiAffordability`,
  `formatINR`.
- [src/utils/storage.js](../src/utils/storage.js) — added 5 new keys for
  the new persistable slices; `clearSession()` now wipes them too.

## Persistence

All new slices are hydrated lazily from localStorage and re-saved on every
state change via `useEffect`. Refresh on any tracker view restores the
exact record + timeline. Sign Out wipes every user-generated slice
(language is preserved).

## Validation

Reuses [src/utils/validation.js](../src/utils/validation.js):
- `isValidName` — manual application + travel passenger.
- `isValidIndianPhone` — manual application + travel passenger.
- `isValidIFSC`, `isValidUPI`, `isValidBankAccount` — remittance.
- Local helpers in TravelPage: `isValidEmail`, departure-after-today,
  return-after-departure, origin ≠ destination.
- Loans require at least one selected need, all required documents
  available, a chosen provider, and consent to share verified profile.
- Insurance requires a chosen plan, a valid payment method, and consent.

## Trust copy

- Provider tags rendered on every card.
- Loans review step: "Real loan products must disclose APR, fees and run
  regulated KYC under RBI/NBFC guidance. This prototype only simulates
  the journey."
- Insurance payment step: "This prototype simulates the policy issuance.
  Real premiums must flow through licensed insurers/banks under IRDAI
  guidance."
- Travel options step: "Real production travel must validate passport /
  visa / health requirements through trusted sources (e.g. IATA Timatic).
  This prototype simulates issuance."
- Remittance How-to-Send drawer: includes RBI MTSS / RDA / NPCI partner
  disclosure plus fraud + recipient warnings.

## Acceptance criteria status

| Criterion | Status |
|-----------|--------|
| `npm run build` succeeds | ✓ |
| Remittance: quote → provider compare → UPI/Bank/Cash → review → confirm → tracker | ✓ (existing flow + How-to-Send + affiliated banks/agents) |
| Loans: need/amount/docs → bank compare → EMI/relax detail → submit → status → My Loans | ✓ |
| Insurance: categories/providers → plan compare → pay → document → My Insurance | ✓ |
| Jobs: Apply Now → Swift Apply / Manual Apply → tracker | ✓ |
| Travel: airport+date → options → passenger → pay → ticket → profile → reminders | ✓ |
| All new flows persist after refresh | ✓ |
| Reachable from PreDeparture / Home / Profile / Chat | ✓ |
| Blue `#386AF6` remains primary action | ✓ |
| No decorative orange/yellow | ✓ |
| Desktop layouts constrained (form 560px, transaction `screen-lg`, marketplace `screen-xl`) | ✓ |
| Mobile remains full-width | ✓ |
| All providers labelled prototype/mock/integration-ready | ✓ |
| Existing BRD demo flow remains clickable | ✓ |

## Known limitations

- No `src/i18n` setup currently exists in the prototype — the spec asked
  to update language JSON files but those don't exist yet. New strings
  in this sprint are literal English. Adding i18n is a separate sprint.
- Bundle size warning (~624 KB JS minified). Code-splitting per route is
  the next optimisation.
- Document upload is simulated (mark-ready toggle in Loans step 2). Real
  uploads need a storage backend.
