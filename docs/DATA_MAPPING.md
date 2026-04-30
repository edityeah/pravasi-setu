# Migrant Jobs Dataset → App Job Model

`migrant_jobs_dataset.xlsx` (sheet `Jobs`) is the canonical source for the job-discovery
module. The dataset is **not read at runtime** — it is converted at build/author time
into `src/data/migrantJobsData.js` via:

```bash
python scripts/build_migrant_jobs.py
```

## Spreadsheet → Job model

| Spreadsheet column        | App field(s)                                                 | Notes |
|---------------------------|--------------------------------------------------------------|-------|
| `Company Name`            | `employerName`, `employerId` (slugified)                     | Direct |
| `Job Title`               | `title`, `jobRole`                                           | Direct |
| `Domain`                  | `sector`                                                     | Direct |
| `Key Skills Required`     | `requiredSkills` (split on `,`)                              | Comma-separated → array |
| `Salary (INR/month)`      | `salaryAvg`, `salaryMin` (×0.95), `salaryMax` (×1.10)        | Salary range derived around dataset value |
| `Other Benefits`          | `benefits` (array), plus boolean flags                       | Drives `accommodationProvided`, `travelProvided`, `insuranceProvided`, `mealsProvided` |
| `Contract Duration`       | `contractDuration`, `contractMonths`                          | "3 years" → 36 months |
| `Job Location`            | `destinationCity`, plus derived `destinationCountry`, `countryCode`, `countryFlag`, `salaryLocalCurrency`, `salaryLocalMin`, `salaryLocalMax` | City→country lookup table in `scripts/build_migrant_jobs.py` |

Original row is preserved verbatim under `rawSource` for debugging / future use.

## Mock / enriched fields (NOT in spreadsheet — flagged here)

Generated deterministically from a hash of `(company + title + index)` so the values are
stable across builds.

| Field                            | Purpose                                                  |
|----------------------------------|----------------------------------------------------------|
| `recruiterName` / `agencyName`   | Required by the BRD employer/recruiter screens            |
| `requiredExperience(Years)`      | Used by job filter & detail screen                        |
| `educationRequirement`           | Used by job detail; needed by ProfileSetup matching       |
| `languageRequirement`            | Drives chatbot language hints                             |
| `serviceFee` / `agentFee`        | Cost calculator integration                               |
| `applicationDeadlineDays`        | Application tracker                                       |
| `verificationStatus`, `verified` | Verified-jobs filter; flagged badge                       |
| `flagged`                        | Triggers fraud / unsafe employer warning                  |
| `employerTrustScore`/`trustScore`| Star rating + employer profile bars                       |
| `reviews`                        | Trust score review count                                  |
| `seats`                          | "X seats remaining" badge                                 |
| `posted`                         | Relative posted-time chip                                 |
| `visaSupport`                    | Always true for these overseas postings                   |
| `salaryLocalMin/Max`, `salaryLocalCurrency` | Local-currency display (AED/SAR/QAR/OMR/KWD)   |

The original spreadsheet uses synthetic data, so some rows have job titles that don't
match their domain (e.g. an "Electrician" listed under "Healthcare"). The conversion
preserves the dataset values rather than "correcting" them — use the source-of-truth
as-is and treat oddities as test data.

## Employer aggregate

`MIGRANT_EMPLOYERS` is derived per unique `Company Name`. Trust score and open-job count
are aggregated from job rows. `compliance` flags and `description` are mock/enriched
(seeded by company-name hash, marked accordingly in the JS file).

## Remittance data

Hand-written mock data lives in [src/data/mockData.js](../src/data/mockData.js):

- `RECIPIENTS` — saved beneficiaries (UPI / bank / cash methods).
- `PAYOUT_METHODS` — UPI / BANK / CASH option cards.
- `FUNDING_METHODS` — debit / credit / bank transfer / wallet / agent.
- `REMITTANCE_PROVIDERS` — 8 sample partners; each has `tag` set to one of
  `Prototype partner`, `Mock regulated partner`, `Integration-ready`.
- `SOURCE_COUNTRIES`, `TRANSFER_PURPOSES`, `TRANSFER_STATUSES`,
  `RATE_ALERTS`, `TRANSFER_SUPPORT_TICKETS` — small starter sets.
- `TRANSFERS` — three sample transfers showing happy path (UPI processing),
  delivered (bank), and exception (cash pickup expired → refund initiated).

See [REMITTANCE_FLOW.md](REMITTANCE_FLOW.md) for how these objects flow
through the multi-step remittance UI.
