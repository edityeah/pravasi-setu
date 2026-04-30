# Resume Builder & Skill Passport — Implementation Notes

This sprint promoted the Skill Passport from a static card list into an
**editable resume workspace** with a downloadable A4 PDF.

## Files

| Concern                                      | File                                                                                |
|----------------------------------------------|-------------------------------------------------------------------------------------|
| Editable workspace + live preview + PDF      | [src/pages/ResumeBuilderPage.jsx](../src/pages/ResumeBuilderPage.jsx)               |
| Skill Passport read-only view + entry points | [src/pages/SkillPassportPage.jsx](../src/pages/SkillPassportPage.jsx)               |
| Persistent state slice                       | [src/context/AppContext.jsx](../src/context/AppContext.jsx) (`resume`, `setResume`) |
| localStorage key                             | `pravasi_resume_data` ([storage.js](../src/utils/storage.js))                       |
| i18n key skeletons (en/hi/ml/ta/bn/or)       | [src/i18n/translations/](../src/i18n/translations/)                                 |

## Data model

```ts
type Resume = {
  template: 'clean' | 'passport' | 'overseas'
  visibility: 'private' | 'shareable'
  lastUpdated: number      // ms epoch — drives "Saved" indicator
  personal: {
    name, phone, email, location,
    preferredCountry, preferredRole,
    passportAvailable, kycVerified,
    passportId, skillPassportId,
  }
  summary: string
  skills:         { id, name, level, years, verified }[]
  certifications: { id, name, issuer, year, expiry, certNumber, verified }[]
  experience:     { id, title, company, country, duration, current,
                    responsibilities, tools }[]
  education:      { id, qualification, institution, year, field }[]
  languages:      { id, name, speaking, reading, writing }[]
  documents:      { id, label, status }[]    // available / pending / expired / not_uploaded
  references:     { id, name, relation, phone, company, consent }[]
}
```

The slice is hydrated lazily from localStorage; if no record exists it is
**seeded from the existing `profile`** so the resume isn't empty for first-
time users.

## Editor → Preview architecture

- **Mobile** uses a 3-tab top bar: Edit / Preview / Download.
- **Desktop** uses a 5-column grid: 3-col editor on the left, 2-col sticky
  A4 preview on the right (`lg:sticky lg:top-4`).
- Every section is a `SectionCard` with its own Add / Edit / Remove
  affordances; updates flow through `setResume(r => …)` and persist
  immediately via the existing `useEffect` save-on-change in AppContext.
- The "Saved" indicator flashes for 1.4 s after each `lastUpdated` change.

## Templates

| Id | Name | Behaviour |
|----|------|-----------|
| `clean`    | Clean Worker        | Black header band, no badges, ATS-friendly. |
| `passport` | Skill Passport      | Blue header, verified badges, Skill Passport ID. |
| `overseas` | Overseas Application | Adds destination-readiness badge + Document readiness section. |

## PDF generation (paginated)

No PDF library is added — the prototype stays at zero new dependencies.
Multi-page output is produced by **content-aware pagination** + the
browser's print engine.

### Pagination algorithm
[`paginateResume(resume)`](../src/pages/ResumeBuilderPage.jsx) walks the
ordered list of resume sections and packs them into A4 pages with a
greedy budget per page. Atomic items (work experience entries,
certificates, education rows, references) cannot split mid-item — if one
doesn't fit on the current page, the entire item moves to the next page,
and the section heading is repeated with a "(continued)" suffix on the
next page.

Heuristic budgets in **mm** (predictable, not pixel-perfect — the
browser's `break-inside: avoid` is the safety net):

| Constant            | Value | What it covers                                |
|---------------------|------:|------------------------------------------------|
| `PAGE1_BUDGET_MM`   | 200   | Page 1 minus blue header (~32 mm) + footer (~12 mm) |
| `PAGEN_BUDGET_MM`   | 225   | Continuation page minus compact header + footer |
| `HEADING_MM`        | 8     | Section heading + divider + margin |
| Experience item     | 12 + bullets × 4 mm + tools | atomic |
| Certification item  | 6     | atomic |
| Education item      | 7     | atomic |
| Language item       | 5     | atomic (2-column grid → 5 mm per item) |
| Document item       | 4     | atomic (3-column grid) |
| Reference item      | 18    | atomic |
| Summary             | 6 + ⌈chars/90⌉ × 4 | block |
| Skills              | 5 + ⌈chips/4⌉ × 7 | block (chip rows wrap) |

### Page components
- `<ResumePrintDocument resume />` – wraps an array of pages.
- `<ResumePrintPage page pageNumber totalPages>` – one A4 frame.
- `<MainResumeHeader>` – page 1 only; full blue band + NSDC mark + name +
  Skill Passport ID.
- `<ContinuationHeader>` – page 2+; compact band with name + "Resume
  continued" + Skill Passport ID.
- `<ResumePrintSection section>` – wraps any section with
  `.resume-section` class so `break-inside: avoid` applies.
- `<ResumeFooter pageNumber totalPages>` – pinned absolutely at
  `bottom: 8mm` so it never overlaps content; shows "Generated by
  Pravasi Setu · {date} · Page X of Y · Prototype document".

### Print isolation
Print is gated on a `body.printing-resume` class. `onPrint`:

1. Swaps `document.title` to `Pravasi_Setu_Resume_<Candidate_Name>`.
2. Adds `printing-resume` to `document.body`.
3. Calls `window.print()`.
4. Listens to `afterprint` (and `focus` as a Safari fallback) to remove
   the class and restore the title.

The `@page { size: A4; margin: 0 }` rule lets us draw exact A4 frames
with `width: 210mm; min-height: 297mm; padding: 14mm 14mm 18mm` and
`page-break-after: always`. `body.printing-resume *` becomes
`visibility: hidden`, with `#resume-print-root` and its descendants
re-enabled — so the editor / sidebar / preview UI never appears in the
PDF.

### Section grooming for print
- Empty sections are dropped before pagination (no empty Reference card
  on page 2).
- Work experience `responsibilities` is split into bullets via
  `bulletsOf(text, 4)` — caps at 4 bullets to keep page geometry stable.
- Documents grid renders only on the **overseas** template.
- Languages section appends "S = Speaking · R = Reading · W = Writing"
  legend so the abbreviated grid is self-explanatory.

### Preview / export parity (canonical A4)
The earlier sprint shipped a "screen mode" that rendered each page with
`aspect-ratio: 210/297` and a smaller padding. That broke parity: the
preview's content frame was a different size from the print's A4 page,
so a layout that overflowed into "page 2" on screen would fit on a
single page in the printed PDF (and vice versa).

Both the on-screen preview AND the print root now render `.resume-print-page`
at **exactly** the canonical A4 dimensions:

```js
const A4_PAGE_WIDTH_MM       = 210
const A4_PAGE_HEIGHT_MM      = 297
const PAGE_PADDING_TOP_MM    = 14
const PAGE_PADDING_X_MM      = 14
const PAGE_PADDING_BOTTOM_MM = 18
```

The on-screen preview lives inside `<ResumeScreenPreview>`, which uses a
`ResizeObserver` to measure the container width and apply
`transform: scale(s)` to a wrapper around the canonical pages. The pages
themselves never resize — only the wrapper visually scales. The reserved
height in the layout is computed from `pages.length × 297mm + gaps`
multiplied by the same scale, so the editor panel doesn't collapse
around an absolutely-positioned stack.

`#resume-print-root` is `display: none` on screen and revealed only when
`body.printing-resume` is set during `window.print()`.

The preview banner shows "Live preview · A4 · {pageCount} page(s)" so the
user can see how their content will paginate before printing — and that
count is now guaranteed to match the printed output.

### Print parity safety net (rAF + page-count check)
`onPrint` waits two animation frames so the print root has fully laid
out, then queries the DOM:

```js
const printPages = document.querySelectorAll(
  '#resume-print-root .resume-print-page'
).length
if (printPages !== expected) {
  console.warn('Resume print page mismatch', { preview: expected, print: printPages })
}
window.print()
```

If a future change ever drifts preview and print apart, the mismatch
will surface in the console immediately.

This satisfies the "browser print-to-PDF fallback" the spec explicitly
allows. Production should swap to a server-side PDF render (Puppeteer /
a PDF generation service) for predictable typography and pagination
across exotic content.

## Validation

- Personal: `isValidName`, `isValidIndianPhone`, optional but valid email,
  location ≥ 3 chars.
- Summary: 40-character minimum surfaced inline, max 500 with counter.
- Skills: name required, years 0–50, level enum.
- Experience: title + employer required.
- Education: qualification required, year valid.
- Certifications: name + issuer required, year sane (1950 – next year).
- Languages: name required, level enums.
- Documents: status from `available / pending / expired / not_uploaded`.
- References: name optional but flagged with consent checkbox.

## Profile completeness / readiness

`completenessScore(resume)` (in ResumeBuilderPage) and
`completenessFromResume(resume)` (in SkillPassportPage) both score on
the same 11 checks: name, phone, location, summary length, skills,
verified skill, certifications, experience, education, languages,
≥ 3 available documents.

The score appears on:
- Resume Builder (top of editor) with a coloured progress bar.
- Skill Passport (header band) as a 4th stat + readiness bar.
- JobApplyChoice → Swift Apply card (with a "Complete Resume"
  checklist when readiness < 60 %).

## Routing entry points

- `Profile → Documents & Skills → Resume Builder` opens the page.
- `Profile → My Services` already shows `My Applications` etc.
- `Skill Passport` header now has Edit / Share / Download icons; the
  bottom CTA row offers `Edit Passport` (outline) and `Open Resume
  Builder` (primary).
- `JobApplyChoice → Swift Apply` shows a checklist + "Complete resume" CTA.
- Chatbot: 9 new intents (`create my resume`, `download my resume`,
  `add education / experience / certificate`, `show my skill passport`,
  `share my profile`, `apply with my resume`, `resume builder`).

## i18n note

A minimal `src/i18n/translations/{en,hi,ml,ta,bn,or}.json` skeleton was
added with the keys requested by the spec (`resume.builder.*`,
`resume.sections.*`, `resume.actions.*`, `resume.validation.*`,
`resume.status.*`). The runtime translator/provider is **not** wired yet —
new strings remain literal English in JSX, matching the rest of the app.
Wiring `useTranslation` and switching all literals to `t(key)` is a
separate sprint.

## Known limitations

- PDF fidelity depends on the user's browser print engine — Chrome/Edge
  give the best result.
- No server-side resume hosting yet, so the "Share" button copies a stub
  link only.
- File uploads are mocked (status toggle on Documents); real uploads need
  a backend.
- The completeness score is heuristic, not predictive.
