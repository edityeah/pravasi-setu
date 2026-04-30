# Requirement Traceability Matrix

Maps the design + remittance acceptance criteria to the source files that
satisfy them.

## Design system (SwiftChat)

| Requirement                                  | File(s)                                                             |
|----------------------------------------------|---------------------------------------------------------------------|
| Primary brand color = `#386AF6`              | [tailwind.config.js](../tailwind.config.js), [src/styles/tokens.css](../src/styles/tokens.css) |
| Backgrounds white + light-neutral             | [tailwind.config.js](../tailwind.config.js) (`surface.*`), [src/index.css](../src/index.css) |
| Pill buttons + inputs                         | [src/components/Button.jsx](../src/components/Button.jsx), [src/components/Input.jsx](../src/components/Input.jsx) |
| Mixed-corner chat bubbles (sender cue)        | [src/pages/ChatPage.jsx](../src/pages/ChatPage.jsx) (`rounded-bl-sm` / `rounded-br-sm`) |
| Mukta + Noto Sans for Indic                  | [src/styles/theme.css](../src/styles/theme.css)                     |
| Token-based components                       | [src/components/](../src/components/) (Button, Input, Card, StatusChip, Stepper, Timeline, AlertBanner, PartnerStrip) |
| Semantic CSS variables                       | [src/styles/tokens.css](../src/styles/tokens.css)                   |
| Responsive 320px → 1440px                     | [src/App.jsx](../src/App.jsx) (no phone-frame), JobsPage / JobDetail / Calculator master-detail grids |

## Branding

| Requirement                                  | File(s)                                                             |
|----------------------------------------------|---------------------------------------------------------------------|
| ConveGenius favicon                           | [public/favicon.png](../public/favicon.png), [index.html](../index.html) |
| NSDC partner asset                            | [public/nsdc.png](../public/nsdc.png)                                |
| Partner strip on splash / KYC / passport / cert / remittance | [src/components/PartnerStrip.jsx](../src/components/PartnerStrip.jsx) used in those pages |
| "Powered by ConveGenius" copy                 | [src/components/PartnerStrip.jsx](../src/components/PartnerStrip.jsx) |

## Remittance flow

| Requirement                              | File(s) / location                                                          |
|------------------------------------------|-----------------------------------------------------------------------------|
| Quote calculator                          | RemittancePage `QuoteStep`                                                  |
| Delivery method selection (UPI/Bank/Cash) | RemittancePage `MethodStep` + `PAYOUT_METHODS` in mockData                  |
| Dynamic recipient form                    | RemittancePage `RecipientStep` (UPI/BANK/CASH branches)                     |
| Sender KYC                                | RemittancePage `KYCStep`                                                    |
| Funding method                            | RemittancePage `FundingStep` + `FUNDING_METHODS`                            |
| Review with warnings                      | RemittancePage `ReviewStep` + `AlertBanner` (fraud + refund)                |
| Confirmation w/ ID, share, notify, save  | RemittancePage `ConfirmationStep`                                           |
| Tracker with full status enum             | TransferTrackerPage `STATUS_TONE` map + `Timeline`                          |
| Exception states                          | TransferTrackerPage exception banner; mockData `TR-9755` cash-pickup-expired |
| Saved recipients                          | mockData `RECIPIENTS`, RemittancePage recipient chips                       |
| Rate alert                                | RemittancePage confirmation step → CTA                                      |
| Chat-first remittance                     | ChatPage intents: send / send to UPI / send to bank / cash pickup / cheapest / track / delayed / receipt / notify / rate alert |

## BRD module coverage

See [PROTOTYPE_GAP_ANALYSIS.md](PROTOTYPE_GAP_ANALYSIS.md) for the full module
coverage table.
