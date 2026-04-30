import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import LogoLockup from '../components/LogoLockup'
import AuthShell from '../components/AuthShell'
import PartnerStrip from '../components/PartnerStrip'
import { isValidIndianPhone, phoneMessage } from '../utils/validation'
import { Phone, Fingerprint, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const { navigate, signIn } = useApp()
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)
  const phoneValid = isValidIndianPhone(phone)
  const showError = touched && phone && !phoneValid

  return (
    <AuthShell>
      <div className="text-center pt-2">
        <LogoLockup variant="centered" size={72} />
      </div>

      <div>
        <h1 className="text-[24px] font-bold text-txt-primary leading-tight">
          Welcome back
        </h1>
        <p className="text-[14px] text-primary mt-1">
          Let's get you home or abroad — safely.
        </p>
      </div>

      <div>
        <label className="text-[12px] font-semibold text-txt-secondary uppercase tracking-wide">Mobile number</label>
        <div className={`flex items-center mt-2 border-2 rounded-pill px-4 transition-colors focus-within:shadow-focus ${
          showError ? 'border-danger' : 'border-bdr focus-within:border-primary'
        }`}>
          <span className="text-[14px] font-semibold text-txt-secondary mr-2">+91</span>
          <input
            inputMode="numeric"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onBlur={() => setTouched(true)}
            placeholder="98765 43210"
            className="flex-1 py-3 text-[15px] outline-none bg-transparent"
          />
          <Phone size={16} className={showError ? 'text-danger' : 'text-txt-tertiary'} />
        </div>
        {showError && (
          <p className="text-[12px] font-medium text-danger mt-1.5">{phoneMessage}</p>
        )}

        <button
          onClick={() => {
            setTouched(true)
            if (phoneValid) {
              signIn({ kycStatus: 'pending' })
              navigate('otp')
            }
          }}
          disabled={!phoneValid}
          className="w-full mt-5 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3.5 rounded-pill shadow-modal active:opacity-90 disabled:bg-primary-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          Send OTP <ArrowRight size={18} />
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-bdr" />
          <span className="text-[11px] font-semibold text-txt-tertiary">OR</span>
          <div className="flex-1 h-px bg-bdr" />
        </div>

        <button
          onClick={() => { signIn({ kycStatus: 'pending' }); navigate('kyc') }}
          className="w-full border-2 border-primary text-primary font-semibold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 active:bg-primary-light"
        >
          <Fingerprint size={18} />
          Login with Aadhaar / DigiLocker
        </button>

        <div className="mt-6 p-3 bg-info-light rounded-xl flex items-start gap-2">
          <ShieldCheck size={16} className="text-info flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-info leading-relaxed">
            Your identity is secured with Aadhaar-based KYC. We never share your data with employers without consent.
          </p>
        </div>

        <p className="text-center text-[11px] text-txt-tertiary mt-6">
          By continuing you agree to our{' '}
          <span className="text-primary font-semibold">Terms</span> &{' '}
          <span className="text-primary font-semibold">Privacy Policy</span>
        </p>
      </div>

      <PartnerStrip className="mt-2" />
    </AuthShell>
  )
}
