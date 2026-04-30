/** @type {import('tailwindcss').Config} */
// Tokens follow swiftchat-design-system.md. Primitive → semantic → component.
// Tailwind class names are kept (primary, accent, surface, txt, bdr, ok, warn,
// danger, info) so existing pages reskin automatically when the values change.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Montserrat', 'system-ui', 'sans-serif'],
        indic: ['Mukta', 'Noto Sans Devanagari', 'Noto Sans', 'sans-serif'],
        noto:  ['Noto Sans', 'sans-serif'],
      },
      fontSize: {
        // SwiftChat scale shortcuts (size/line-height pairs)
        '10': ['10px', '14px'],
        '11': ['11px', '14px'],
        '12': ['12px', '16px'],
        '14': ['14px', '20px'],
        '16': ['16px', '24px'],
        '18': ['18px', '24px'],
        '20': ['20px', '28px'],
        '24': ['24px', '32px'],
        '28': ['28px', '36px'],
      },
      colors: {
        // ── Brand / interactive (SwiftChat blue ramp)
        primary: {
          DEFAULT: '#386AF6', //  primary/500 — interactive primary
          dark:    '#1339A3', //  primary/600 — hover
          press:   '#2B3E8B', //  primary/700 — active
          light:   '#EEF2FF', //  primary/50  — icon wrapper / subtle bg
          50:      '#EEF2FF',
          100:     '#E0E7FF',
          200:     '#C3D2FC',
          300:     '#84A2F4',
          400:     '#345CCC',
          500:     '#386AF6',
          600:     '#1339A3',
          700:     '#2B3E8B',
        },
        // ── Accent (kept for warm highlights, e.g. SAFE MIGRATION strip)
        accent: {
          DEFAULT: '#F97316',
          light:   '#FFF1E6',
        },
        // ── Surfaces (semantic/background)
        surface: {
          DEFAULT:   '#FFFFFF', // page bg
          secondary: '#ECECEC', // app bg / card-on-page subtle
          chat:      '#F4F6FA', // chat canvas
        },
        // ── Text (semantic/text)
        txt: {
          primary:   '#0E0E0E',
          secondary: '#7383A5',
          tertiary:  '#828996',
          disabled:  '#999999',
          brand:     '#386AF6',
          inverse:   '#FFFFFF',
          onBrand:   '#FFFFFF',
        },
        // ── Borders (semantic/border)
        bdr: {
          DEFAULT: '#D5D8DF',
          light:   '#ECECEC',
          strong:  '#999999',
          brand:   '#345CCC',
          focus:   '#386AF6',
          error:   '#EB5757',
        },
        // ── Status (semantic/status)
        ok:     { DEFAULT: '#00BA34', light: '#D4F5DC', text: '#007B22', dark: '#007B22' },
        warn:   { DEFAULT: '#F8B200', light: '#FFF3CC', text: '#9A6500', dark: '#9A6500' },
        danger: { DEFAULT: '#EB5757', light: '#FDEAEA', text: '#C0392B', dark: '#C0392B' },
        info:   { DEFAULT: '#386AF6', light: '#E0E7FF', text: '#345CCC' },
        // ── Chat (component-level)
        chat: {
          userBubble: '#386AF6',
          botBubble:  '#ECECEC',
          userText:   '#FFFFFF',
          botText:    '#0E0E0E',
          input:      '#FFFFFF',
          inputBorder:'#D5D8DF',
          timestamp:  '#828996',
        },
      },
      borderRadius: {
        // SwiftChat radius scale
        none: '0px',
        xs:   '2px',
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px',
        pill: '999px',
        full: '999px',
        card: '12px',
      },
      boxShadow: {
        card:   '0 1px 4px rgba(15, 23, 42, 0.06)',
        modal:  '0 8px 24px rgba(56, 106, 246, 0.16)',
        bottom: '0 -2px 8px rgba(15, 23, 42, 0.06)',
        focus:  '0 0 0 3px rgba(56, 106, 246, 0.25)',
      },
      animation: {
        'slide-in': 'slideIn 0.26s cubic-bezier(0.4,0,0.2,1)',
        'fade-in':  'fadeIn 0.18s ease',
        'bubble-in':'bubbleIn 0.18s ease',
        pop:        'pop 0.4s cubic-bezier(0.16,1,0.3,1)',
        typing:     'typing 0.9s infinite',
      },
      keyframes: {
        slideIn:  { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        bubbleIn: { from: { opacity: '0', transform: 'translateY(7px)' }, to: { opacity: '1', transform: 'none' } },
        pop:      { from: { transform: 'scale(0)' }, to: { transform: 'scale(1)' } },
        typing:   {
          '0%,60%,100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%':         { transform: 'translateY(-5px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
