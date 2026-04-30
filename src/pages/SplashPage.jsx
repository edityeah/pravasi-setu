import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import LogoLockup from '../components/LogoLockup'
import PartnerStrip from '../components/PartnerStrip'
import { Check, Globe } from 'lucide-react'

const LANGS = [
  { code: 'en', native: 'English',   english: 'English'   },
  { code: 'hi', native: 'हिन्दी',     english: 'Hindi'     },
  { code: 'ml', native: 'മലയാളം',   english: 'Malayalam' },
  { code: 'ta', native: 'தமிழ்',     english: 'Tamil'     },
  { code: 'bn', native: 'বাংলা',     english: 'Bengali'   },
  { code: 'or', native: 'ଓଡ଼ିଆ',     english: 'Odia'      },
]

export default function SplashPage() {
  const { navigate, lang, setLang } = useApp()
  const [selected, setSelected] = useState(lang || 'en')

  const handleContinue = () => {
    setLang(selected)
    navigate('login')
  }

  return (
    <div className="flex-1 flex flex-col items-center bg-white overflow-y-auto">
      <div className="w-full max-w-[560px] flex flex-col items-center justify-between min-h-full px-4 sm:px-6 py-8 gap-8">
        <div className="w-full pt-2">
          <LogoLockup variant="centered" size={80} showTagline />
        </div>

        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-primary" />
            <span className="text-[14px] font-bold text-txt-primary">Choose your language</span>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {LANGS.map(l => {
              const active = selected === l.code
              return (
                <button
                  key={l.code}
                  onClick={() => setSelected(l.code)}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 py-4 px-3 transition-all active:scale-[0.97] ${
                    active ? 'bg-primary-light border-primary' : 'bg-white border-bdr hover:border-primary'
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </span>
                  )}
                  <span className={`text-[16px] font-bold ${active ? 'text-primary' : 'text-txt-primary'}`}>
                    {l.native}
                  </span>
                  {l.code !== 'en' && (
                    <span className="text-[11px] text-txt-tertiary mt-0.5">{l.english}</span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-center text-[11px] text-txt-tertiary mt-3">
            Voice support available in all languages
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-primary text-white font-bold text-[15px] py-3.5 rounded-pill shadow-modal active:opacity-80"
        >
          Continue
        </button>

        <PartnerStrip className="w-full mt-2" />
      </div>
    </div>
  )
}
