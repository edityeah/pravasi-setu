import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import TopBar from '../components/TopBar'
import LogoLockup from '../components/LogoLockup'
import { ShieldCheck, Edit2 } from 'lucide-react'

export default function OTPPage() {
  const { navigate, goBack, signIn } = useApp()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(30)
  const inputs = useRef([])

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const handleChange = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = d
    setOtp(next)
    if (d && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(x => x)) setTimeout(() => {
      signIn({ kycStatus: 'pending' })
      navigate('kyc')
    }, 350)
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      <TopBar title="Verify your number" />

      <div className="flex-1 overflow-y-auto flex justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-[560px]">
          <div className="flex justify-center mb-4">
            <LogoLockup variant="iconOnly" size={48} />
          </div>

          <p className="text-[14px] text-txt-secondary leading-relaxed text-center">
            We sent a 6-digit code to
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[15px] font-bold text-txt-primary">+91 98765 43210</span>
            <button onClick={goBack} className="text-primary" aria-label="Edit number">
              <Edit2 size={14} />
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2 mt-8 max-w-[360px] mx-auto">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => (inputs.current[i] = el)}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="w-full aspect-[3/4] min-w-0 border-2 border-bdr rounded-xl text-center text-[20px] font-bold text-txt-primary focus:border-primary focus:bg-primary-light/40 outline-none transition-colors"
              />
            ))}
          </div>

          <div className="mt-6 text-center">
            {seconds > 0 ? (
              <p className="text-[12px] text-txt-secondary">
                Resend code in <span className="font-bold text-primary">{seconds}s</span>
              </p>
            ) : (
              <button onClick={() => setSeconds(30)} className="text-[13px] font-semibold text-primary">
                Resend OTP
              </button>
            )}
          </div>

          <div className="mt-6 p-3 bg-primary-light rounded-xl flex items-start gap-2">
            <ShieldCheck size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-primary leading-relaxed">
              For demo: enter any 6 digits to continue to KYC.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
