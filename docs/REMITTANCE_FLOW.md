# Pravasi Setu — Inward Remittance Flow

The remittance module follows `india_remittance_feature_research.md` (sections
§5 user flow, §9 screens, §12 data model, §14 exception states, §15 trust copy).
**This is a UI prototype** — there is no real RBI / NPCI / MTSS / RDA / banking
integration. Every provider is labelled as "Prototype partner",
"Mock regulated partner" or "Integration-ready" so the UX cannot be mistaken
for a production financial product.

## Flow

```
1 Quote → 2 Method → 3 Recipient → 4 KYC → 5 Funding → 6 Review → 7 Confirmation → Tracker
```

| Step | Screen                                  | Source-doc reference |
|------|-----------------------------------------|----------------------|
| 1    | Quote calculator + provider compare      | §5.1, §9.Screen 1    |
| 2    | Delivery method (UPI / BANK / CASH)      | §6.3, §9.Screen 2    |
| 3    | Saved recipients + dynamic form per method + purpose dropdown | §9.Screen 3, §13 |
| 4    | Sender KYC summary (already verified)    | §9.Screen 4          |
| 5    | Funding method — debit / credit / bank / wallet / agent | §6.1, §9.Screen 5 |
| 6    | Review with fraud + recipient warnings   | §15, §9.Screen 6     |
| 7    | Confirmation: ID, share, notify, save, alert, "Send again" | §9.Screen 7 |
| 8    | Transfer tracker — full status enum + exception banner | §12.3, §14 |

All steps live in [src/pages/RemittancePage.jsx](../src/pages/RemittancePage.jsx);
the tracker lives in [src/pages/TransferTrackerPage.jsx](../src/pages/TransferTrackerPage.jsx).

## Mock data

Defined in [src/data/mockData.js](../src/data/mockData.js):

- `RECIPIENTS` — saved beneficiaries (Sunita / Father / Brother) with UPI, bank
  and cash-pickup methods.
- `PAYOUT_METHODS` — UPI / BANK / CASH cards (label, ETA, fee%, description).
- `FUNDING_METHODS` — debit, credit, bank transfer, Apple/Google Pay, agent.
- `REMITTANCE_PROVIDERS` — Wise, Western Union, Remitly, MoneyGram, WorldRemit,
  SBI, ICICI Money2India, NPCI UPI Foreign Inward (rate, fee, tag).
- `SOURCE_COUNTRIES` — UAE, KSA, Qatar, Kuwait, Oman, Bahrain, USA, UK with FX
  rates against INR.
- `TRANSFER_PURPOSES` — Family maintenance, Education, Medical, Gift, Travel,
  Personal savings, Other.
- `TRANSFER_STATUSES` — full enum including `KYC_REQUIRED`, `COMPLIANCE_REVIEW`,
  `UPI_PROCESSING`, `BANK_PROCESSING`, `READY_FOR_PICKUP`, `FAILED`,
  `CANCELLED`, `REFUND_INITIATED`, `REFUNDED`.
- `RATE_ALERTS`, `TRANSFER_SUPPORT_TICKETS` — small starter set.

## Validation rules

| Field           | Prototype validation                        |
|-----------------|---------------------------------------------|
| UPI ID          | `/^[a-z0-9._-]{3,}@[a-z]{2,}$/i`            |
| IFSC code       | `/^[A-Z]{4}0[A-Z0-9]{6}$/`                  |
| Account number  | numeric, ≥6 chars, must match the confirm field |
| Pickup city     | non-empty                                   |
| Purpose         | one of `TRANSFER_PURPOSES`                  |

## Trust + compliance copy

Per §15 of the research doc:

- **Recipient warning** (recipient step):
  "Confirm the recipient details carefully. Incorrect bank, UPI or cash pickup
  details may delay the transfer or require a refund."
- **Fraud warning** (review step):
  "Only send money to people you know and trust. Do not send money for jobs,
  lottery winnings, visa promises, crypto investments, or unknown callers."
- **Refund policy** (review step):
  "Refund is available if the transfer is not paid out or credited."
- **KYC prompt** (KYC step):
  "We need to verify your identity to keep transfers secure and comply with
  financial regulations. This usually takes a few minutes."
- **Provider tag**: every provider card shows its prototype/mock label so the
  user (and reviewer) cannot misread it as live integration.

## Confirmation actions

The success screen offers six actions:
- Track transfer
- Download receipt (toast)
- Share receipt (toast)
- Save recipient (toast)
- Notify receiver (toast)
- Send again (resets stepper to 0)
- Set rate alert (toast)

## Tracker

`TransferTrackerPage` renders a list view (mini-progress bar coloured by
status / exception) and a detail view with:

- Status chip mapped to tone (success / warning / error / info / brand)
- Headline KV table including FX, fee, source amount, recipient amount
- `Timeline` component with success / current / exception nodes
- Quick actions: View receipt, Download PDF, Share, Notify recipient by SMS,
  Call provider support, Send again, Raise dispute → grievance
- Footer disclosure: "shown as a prototype/mock partner — real transfers must
  use a regulated MTSS / RDA / NPCI inward-remittance partner per RBI guidance."

## Chat intents (chatbot)

`ChatPage` understands: send money, send to UPI / bank / cash pickup, cheapest
way, track transfer, transfer delayed, download receipt, notify receiver, set
rate alert. Each intent navigates into the relevant remittance step or the
tracker.
