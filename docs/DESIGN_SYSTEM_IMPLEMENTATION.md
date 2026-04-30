# SwiftChat Design System Implementation

This prototype follows the SwiftChat design system (`swiftchat-design-system.md`) as
the single source of truth for colour, typography, spacing, radius and grid.

## Token architecture

```
Primitive tokens          → Semantic tokens               → Components
(tailwind.config.js)        (tailwind theme + tokens.css)   (Card, Button, Stepper, …)
```

- **Primitive layer:** raw hex/px values, defined inside `tailwind.config.js` under
  `theme.extend.colors` (e.g. `primary.500 = #386AF6`).
- **Semantic layer:** CSS variables in [src/styles/tokens.css](../src/styles/tokens.css)
  (`--color-background-default`, `--color-text-primary`, …) plus utility classes in
  [src/styles/theme.css](../src/styles/theme.css).
- **Components:** consume tokens through Tailwind classes (`bg-primary`,
  `text-txt-secondary`, `rounded-pill`) — never hardcoded hex inside JSX.

## Colour reskin

`primary` was repointed from teal `#0F766E` to SwiftChat blue `#386AF6`. Because
every page uses `bg-primary` / `text-primary` / `bg-primary-light` (etc.), the
single tailwind change reskins the whole app to blue + neutrals. Status colours
were aligned to SwiftChat values (`#00BA34`, `#F8B200`, `#EB5757`).

| Role                 | Token                            | Light value |
|----------------------|----------------------------------|-------------|
| Brand interactive    | `bg-primary` / `text-primary`    | `#386AF6`   |
| Brand subtle bg      | `bg-primary-light`               | `#EEF2FF`   |
| Page background      | body / `bg-surface`              | `#FFFFFF`   |
| App surface          | `bg-surface-secondary`           | `#ECECEC`   |
| Border default       | `border-bdr`                     | `#D5D8DF`   |
| Text primary         | `text-txt-primary`               | `#0E0E0E`   |
| Text secondary       | `text-txt-secondary`             | `#7383A5`   |
| Status — success     | `bg-ok` / `text-ok`              | `#00BA34`   |
| Status — warning     | `bg-warn` / `text-warn-text`     | `#F8B200`   |
| Status — error       | `bg-danger` / `text-danger`      | `#EB5757`   |

## Typography

- Latin: **Montserrat** (already loaded).
- Devanagari/Indic: **Mukta** (loaded via `theme.css`).
- Tamil/Telugu/other scripts: **Noto Sans** (loaded via `theme.css`).

Utility classes are exported in `theme.css`:
`.text-title-large`, `.text-title-medium`, `.text-label-medium`, `.text-body-medium`,
`.text-caption`, `.text-caption-small`, `.text-body-indic`, `.text-label-indic`.

## Spacing

The tailwind defaults already match the SwiftChat scale (`8/12/16/24/32/48`).
Pages use these values via `gap-2`, `p-3`, `p-4`, `gap-6`, `mt-8` etc.

## Radius

Custom radii added: `rounded-pill` (999px), `rounded-card` (12px), `rounded-md`
(8px) etc. Pill is used for buttons + inputs; `rounded-card` for cards; mixed
corners on chat bubbles.

## Shared components

New shared components in `src/components/`:

| Component        | Purpose                                                |
|------------------|--------------------------------------------------------|
| `Button.jsx`     | Pill primary / secondary / ghost / destructive button  |
| `Input.jsx`      | Pill input with label + helper / error states          |
| `Card.jsx`       | Standard raised card with shadow + radius              |
| `StatusChip.jsx` | Tone-driven badge (success/warning/error/info/brand)   |
| `Stepper.jsx`    | Multi-step progress for remittance / profile setup     |
| `Timeline.jsx`   | Vertical timeline (transfer / application / ticket)    |
| `AlertBanner.jsx`| Tone-driven banner for warnings / KYC / fraud          |
| `PartnerStrip.jsx` | "Powered by ConveGenius / NSDC International" strip  |
| `Logo.jsx`       | SwiftChat-blue Pravasi Setu mark                       |

## Branding

- Favicon = ConveGenius square logo (`public/favicon.png`).
- Partner strip uses ConveGenius + NSDC International logos
  (`public/convegenius.png`, `public/nsdc.png`).
- Strips appear on Splash, KYC, Skill Passport, Certificate Verification, and
  the Remittance flow's sticky summary panel.

## Responsive grid

The shell is no longer wrapped in a phone bezel — `App.jsx` is `h-screen w-screen`
with each page filling the viewport. Pages cap content with
`max-w-screen-md / xl mx-auto` so the layout reads correctly on desktop.
JobsPage uses `md:grid-cols-2 xl:grid-cols-3`; JobDetail and Calculator use
`lg:grid-cols-2/3`. BottomNav buttons cap at 768px so tap targets don't sprawl.
