import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import TopBar from '../components/TopBar'
import PartnerStrip from '../components/PartnerStrip'
import {
  Fingerprint, FileText, BookUser, Check, ArrowRight, ShieldCheck,
  RefreshCw, X
} from 'lucide-react'
import {
  isValidAadhaar, aadhaarMessage, isValidCaptcha, captchaMessage, isValidOTP, otpMessage,
} from '../utils/validation'

const CAPTCHA_EXPECTED = '7K9pX2'

const METHODS = [
  { id: 'aadhaar',    icon: Fingerprint, title: 'Aadhaar eKYC', sub: 'Verify via UIDAI · OTP-based' },
  { id: 'digilocker', icon: FileText,    title: 'DigiLocker',   sub: 'Pull govt. documents' },
  { id: 'apaar',      icon: BookUser,    title: 'APAAR ID',     sub: 'Academic & skill record' },
]

export default function KYCPage() {
  const { navigate, showToast, completeKYC, signIn } = useApp()
  const [done, setDone] = useState({})
  const [active, setActive] = useState(null)

  const handleVerified = (id) => {
    setDone(d => ({ ...d, [id]: true }))
    setActive(null)
    showToast(`${METHODS.find(m => m.id === id).title} verified`)
  }

  const anyDone = Object.values(done).some(Boolean)

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0 relative">
      <TopBar title="Verify your identity" sub="Step 2 of 3" />
      <div className="flex-1 overflow-y-auto flex justify-center px-4 sm:px-5 py-5">
        <div className="w-full max-w-[560px]">
        <p className="text-[13px] text-txt-secondary leading-relaxed">
          Connect any one of these to build a verified profile that employers trust. You can add the others later.
        </p>

        <div className="mt-5 space-y-3">
          {METHODS.map(m => {
            const Icon = m.icon
            const ok = done[m.id]
            return (
              <button
                key={m.id}
                onClick={() => !ok && setActive(m.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all ${
                  ok ? 'border-ok bg-ok-light' : 'border-bdr bg-white active:bg-primary-light'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ok ? 'bg-ok text-white' : 'bg-primary-light text-primary'
                }`}>
                  {ok ? <Check size={22} strokeWidth={3} /> : <Icon size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-txt-primary">{m.title}</div>
                  <div className="text-[11px] text-txt-secondary truncate">{ok ? 'Verified' : m.sub}</div>
                </div>
                {!ok && <span className="text-[12px] font-bold text-primary">Verify</span>}
              </button>
            )
          })}
        </div>

        <div className="mt-6 p-3 bg-primary-light rounded-xl">
          <p className="text-[11px] text-primary leading-relaxed">
            🔐 We use Aadhaar offline KYC. Your biometric data never leaves your device.
          </p>
        </div>

        <PartnerStrip className="mt-6" />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-bdr-light flex-shrink-0 flex justify-center">
        <div className="w-full max-w-[560px]">
        <button
          onClick={() => { completeKYC(); navigate('home') }}
          disabled={!anyDone}
          className="w-full bg-primary text-white font-bold text-[15px] py-3.5 rounded-pill shadow-modal disabled:opacity-40 flex items-center justify-center gap-2"
        >
          Continue to App <ArrowRight size={18} />
        </button>
        {!anyDone && (
          <button onClick={() => { signIn({ hasCompletedOnboarding: true }); navigate('home') }} className="w-full text-[12px] text-txt-tertiary mt-2">
            Skip for now
          </button>
        )}
        </div>
      </div>

      {/* Sub-flow modal */}
      {active === 'aadhaar'    && <AadhaarFlow    onClose={() => setActive(null)} onDone={() => handleVerified('aadhaar')} />}
      {active === 'digilocker' && <DigiLockerFlow onClose={() => setActive(null)} onDone={() => handleVerified('digilocker')} />}
      {active === 'apaar'      && <APAARFlow      onClose={() => setActive(null)} onDone={() => handleVerified('apaar')} />}
    </div>
  )
}

// ─── Modal shell ────────────────────────────────────────────────────────────
// Cap inner content at 640px so the Aadhaar / DigiLocker / APAAR sub-flow
// inputs and CTAs don't sprawl across the desktop viewport.
function FlowShell({ title, onClose, children }) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col z-30 animate-slide-in">
      <div className="h-14 px-1 flex items-center gap-1 flex-shrink-0 border-b border-bdr-light">
        <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full active:bg-surface-secondary">
          <X size={20} />
        </button>
        <div className="flex-1 text-[15px] font-bold text-txt-primary truncate">{title}</div>
      </div>
      <div className="flex-1 min-h-0 flex justify-center">
        <div className="w-full max-w-[640px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Aadhaar OTP eKYC ───────────────────────────────────────────────────────
function AadhaarFlow({ onClose, onDone }) {
  const [step, setStep] = useState('number')   // number → captcha → otp → success
  const [aadhaar, setAadhaar] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [consent, setConsent] = useState(false)
  const [otp, setOtp] = useState(['','','','','',''])
  const [seconds, setSeconds] = useState(0)
  const inputs = useRef([])

  useEffect(() => {
    if (step !== 'otp') return
    inputs.current[0]?.focus()
    setSeconds(30)
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [step])

  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(onDone, 1300)
      return () => clearTimeout(t)
    }
  }, [step, onDone])

  const masked = aadhaar ? `XXXX XXXX ${aadhaar.slice(-4).padStart(4, '•')}` : ''

  const handleOtp = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...otp]; next[i] = d
    setOtp(next)
    if (d && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(x => x)) setTimeout(() => setStep('success'), 400)
  }
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  return (
    <FlowShell title="Aadhaar eKYC" onClose={onClose}>
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {step === 'number' && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
                <Fingerprint size={18} className="text-accent" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-txt-primary">Step 1 of 3</div>
                <div className="text-[11px] text-txt-secondary">Enter Aadhaar / VID</div>
              </div>
            </div>

            {(() => {
              const aadhaarValid = isValidAadhaar(aadhaar)
              const captchaValid = isValidCaptcha(captcha, CAPTCHA_EXPECTED)
              const aadhaarShowError = aadhaar.length === 12 && !aadhaarValid
              const captchaShowError = captcha.length >= 4 && !captchaValid
              const canSubmit = aadhaarValid && captchaValid && consent
              return (
                <>
                  <label className="text-[11px] font-semibold text-txt-secondary uppercase">Aadhaar number</label>
                  <input
                    inputMode="numeric"
                    value={aadhaar.replace(/(\d{4})(?=\d)/g, '$1 ')}
                    onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="1234 5678 9012"
                    className={`w-full mt-2 border-2 rounded-xl px-3 py-3 text-[15px] tracking-wider outline-none ${
                      aadhaarShowError ? 'border-danger' : 'border-bdr focus:border-primary'
                    }`}
                  />
                  <p className={`text-[10px] mt-1 ${aadhaarShowError ? 'text-danger font-semibold' : 'text-txt-tertiary'}`}>
                    {aadhaarShowError ? aadhaarMessage : 'Your Aadhaar will be masked after verification.'}
                  </p>

                  <label className="text-[11px] font-semibold text-txt-secondary uppercase mt-4 block">Captcha</label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 border-2 border-bdr rounded-xl px-3 py-2.5 bg-surface-secondary font-mono italic text-[16px] tracking-[0.4em] text-txt-primary select-none"
                         style={{ textDecoration: 'line-through', textDecorationColor: '#A8B4C5' }}>
                      {CAPTCHA_EXPECTED}
                    </div>
                    <button onClick={() => {}} className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                      <RefreshCw size={16} className="text-primary" />
                    </button>
                  </div>
                  <input
                    value={captcha}
                    onChange={e => setCaptcha(e.target.value)}
                    placeholder="Type the code above"
                    className={`w-full mt-2 border-2 rounded-xl px-3 py-3 text-[14px] outline-none ${
                      captchaShowError ? 'border-danger' : 'border-bdr focus:border-primary'
                    }`}
                  />
                  {captchaShowError && (
                    <p className="text-[11px] text-danger font-medium mt-1">{captchaMessage}</p>
                  )}

                  <label className="flex items-start gap-2 mt-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
                    />
                    <span className="text-[11px] text-txt-secondary leading-relaxed">
                      I consent to UIDAI sharing my demographic details with{' '}
                      <span className="font-semibold text-txt-primary">Pravasi Setu</span>{' '}
                      for eKYC verification. <span className="text-primary">Read full notice</span>
                    </span>
                  </label>
                  {!consent && aadhaarValid && captchaValid && (
                    <p className="text-[11px] text-danger font-medium mt-1">Please accept consent to continue.</p>
                  )}

                  <div className="mt-6">
                    <button
                      onClick={() => canSubmit && setStep('otp')}
                      disabled={!canSubmit}
                      className="w-full bg-primary text-white font-bold text-[14px] py-3 rounded-pill shadow-card disabled:bg-primary-200 disabled:cursor-not-allowed"
                    >
                      Send OTP to registered mobile
                    </button>
                  </div>
                </>
              )
            })()}
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-info-light flex items-center justify-center">
                <ShieldCheck size={18} className="text-info" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-txt-primary">Step 2 of 3</div>
                <div className="text-[11px] text-txt-secondary">Enter UIDAI OTP</div>
              </div>
            </div>

            <p className="text-[13px] text-txt-secondary leading-relaxed">
              UIDAI sent a 6-digit OTP to the mobile number registered with Aadhaar{' '}
              <span className="font-bold text-txt-primary">{masked}</span>.
            </p>

            <div className="grid grid-cols-6 gap-2 mt-6 max-w-[360px]">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => (inputs.current[i] = el)}
                  value={d}
                  onChange={e => handleOtp(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-full aspect-[3/4] min-w-0 border-2 border-bdr rounded-xl text-center text-[20px] font-bold text-txt-primary focus:border-primary outline-none"
                />
              ))}
            </div>

            <div className="mt-4">
              {seconds > 0 ? (
                <p className="text-[12px] text-txt-secondary">
                  Resend OTP in <span className="font-bold text-primary">{seconds}s</span>
                </p>
              ) : (
                <button onClick={() => setSeconds(30)} className="text-[12px] font-bold text-primary">
                  Resend OTP
                </button>
              )}
            </div>

            <div className="mt-5 p-3 bg-primary-light rounded-xl">
              <p className="text-[10px] text-primary leading-relaxed">
                For demo: enter any 6 digits to continue.
              </p>
            </div>
          </>
        )}

        {step === 'success' && (
          <Success
            title="Aadhaar verified"
            line={`Verified via UIDAI · ${masked}`}
            sub="Demographic data secured. Your full Aadhaar is masked."
          />
        )}
      </div>
    </FlowShell>
  )
}

// ─── DigiLocker ─────────────────────────────────────────────────────────────
const DOC_LIST = [
  { name: 'Aadhaar Card',         issuer: 'UIDAI',                              type: 'Issued',   on: true },
  { name: 'PAN Card',             issuer: 'Income Tax Dept',                    type: 'Issued',   on: true },
  { name: 'Driving Licence',      issuer: 'Ministry of Road Transport',         type: 'Issued',   on: true },
  { name: '10th Marksheet',       issuer: 'CBSE',                               type: 'Issued',   on: true },
  { name: 'ITI Certificate',      issuer: 'NCVT',                               type: 'Issued',   on: false },
  { name: 'Skill India Cert.',    issuer: 'NSDC',                               type: 'Issued',   on: false },
]

function DigiLockerFlow({ onClose, onDone }) {
  const [step, setStep] = useState('login')   // login → otp → consent → fetching → success
  const [mobile, setMobile] = useState('98765 43210')
  const [otp, setOtp] = useState(['','','','','',''])
  const [docs, setDocs] = useState(DOC_LIST)
  const [seconds, setSeconds] = useState(0)
  const inputs = useRef([])

  useEffect(() => {
    if (step !== 'otp') return
    inputs.current[0]?.focus()
    setSeconds(30)
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [step])

  useEffect(() => {
    if (step === 'fetching') {
      const t = setTimeout(() => setStep('success'), 1800)
      return () => clearTimeout(t)
    }
    if (step === 'success') {
      const t = setTimeout(onDone, 1300)
      return () => clearTimeout(t)
    }
  }, [step, onDone])

  const handleOtp = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...otp]; next[i] = d
    setOtp(next)
    if (d && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(x => x)) setTimeout(() => setStep('consent'), 400)
  }
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }
  const toggleDoc = (i) => setDocs(arr => arr.map((d, idx) => idx === i ? { ...d, on: !d.on } : d))
  const selectedCount = docs.filter(d => d.on).length

  return (
    <FlowShell title="DigiLocker" onClose={onClose}>
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {step === 'login' && (
          <>
            <div className="bg-info text-white rounded-card p-4 flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-[18px]">🇮🇳</div>
              <div>
                <div className="text-[13px] font-extrabold">DigiLocker</div>
                <div className="text-[10px] opacity-90">Govt. of India · MeitY</div>
              </div>
            </div>

            <p className="text-[13px] text-txt-secondary leading-relaxed">
              Sign in to your DigiLocker account to share documents with{' '}
              <span className="font-bold text-txt-primary">Pravasi Setu</span>.
            </p>

            <label className="text-[11px] font-semibold text-txt-secondary uppercase mt-5 block">Mobile / Aadhaar</label>
            <input
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full mt-2 border-2 border-bdr rounded-xl px-3 py-3 text-[15px] outline-none focus:border-primary"
            />
            <p className="text-[10px] text-txt-tertiary mt-1">We'll send an OTP to your registered mobile.</p>

            <button
              onClick={() => setStep('otp')}
              className="w-full mt-6 bg-info text-white font-bold text-[14px] py-3 rounded-pill shadow-card"
            >
              Sign in with DigiLocker
            </button>
            <p className="text-[10px] text-center text-txt-tertiary mt-3">
              Don't have an account? <span className="text-info font-semibold">Sign up at digilocker.gov.in</span>
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="text-[14px] font-bold text-txt-primary">Enter DigiLocker OTP</div>
            <p className="text-[12px] text-txt-secondary mt-1">Sent to mobile ending 3210</p>
            <div className="grid grid-cols-6 gap-2 mt-6 max-w-[360px]">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => (inputs.current[i] = el)}
                  value={d}
                  onChange={e => handleOtp(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-full aspect-[3/4] min-w-0 border-2 border-bdr rounded-xl text-center text-[20px] font-bold text-txt-primary focus:border-info outline-none"
                />
              ))}
            </div>
            <div className="mt-4 text-[11px] text-txt-secondary">
              {seconds > 0 ? <>Resend in <span className="font-bold text-info">{seconds}s</span></>
                           : <button onClick={() => setSeconds(30)} className="font-bold text-info">Resend OTP</button>}
            </div>
            <div className="mt-5 p-3 bg-info-light rounded-xl">
              <p className="text-[10px] text-info leading-relaxed">For demo: enter any 6 digits.</p>
            </div>
          </>
        )}

        {step === 'consent' && (
          <>
            <div className="text-[14px] font-bold text-txt-primary">Share these documents?</div>
            <p className="text-[11px] text-txt-secondary mt-1">
              Pravasi Setu is requesting access to the following documents from your DigiLocker.
            </p>

            <div className="mt-4 space-y-2">
              {docs.map((d, i) => (
                <button
                  key={d.name}
                  onClick={() => toggleDoc(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    d.on ? 'border-info bg-info-light' : 'border-bdr bg-white'
                  }`}
                >
                  <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                       style={{ borderColor: d.on ? '#2563EB' : '#E5EBF2', background: d.on ? '#2563EB' : 'transparent' }}>
                    {d.on && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-txt-primary truncate">{d.name}</div>
                    <div className="text-[10px] text-txt-secondary truncate">{d.issuer}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    d.type === 'Issued' ? 'bg-ok-light text-ok' : 'bg-warn-light text-warn'
                  }`}>
                    {d.type}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-surface-secondary rounded-xl">
              <p className="text-[10px] text-txt-secondary leading-relaxed">
                I consent to share the selected documents with Pravasi Setu. Documents are fetched directly from issuing authorities and shared securely.
              </p>
            </div>

            <button
              onClick={() => setStep('fetching')}
              disabled={selectedCount === 0}
              className="w-full mt-5 bg-info text-white font-bold text-[14px] py-3 rounded-pill shadow-card disabled:opacity-40"
            >
              Allow & share {selectedCount} document{selectedCount === 1 ? '' : 's'}
            </button>
          </>
        )}

        {step === 'fetching' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full border-4 border-info-light border-t-info animate-spin mb-5" />
            <div className="text-[14px] font-bold text-txt-primary">Fetching documents…</div>
            <p className="text-[11px] text-txt-secondary mt-1 text-center max-w-[260px]">
              Securely pulling from UIDAI, Income Tax Dept, and CBSE
            </p>
          </div>
        )}

        {step === 'success' && (
          <Success
            title="DigiLocker linked"
            line={`${selectedCount} documents fetched`}
            sub="All documents are verifiable from issuing authorities."
          />
        )}
      </div>
    </FlowShell>
  )
}

// ─── APAAR ID ───────────────────────────────────────────────────────────────
function APAARFlow({ onClose, onDone }) {
  const [step, setStep] = useState('form')   // form → verifying → success
  const [apaar, setApaar] = useState('')
  const [dob, setDob] = useState('')

  useEffect(() => {
    if (step === 'verifying') {
      const t = setTimeout(() => setStep('success'), 1500)
      return () => clearTimeout(t)
    }
    if (step === 'success') {
      const t = setTimeout(onDone, 1300)
      return () => clearTimeout(t)
    }
  }, [step, onDone])

  return (
    <FlowShell title="APAAR ID" onClose={onClose}>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 'form' && (
          <>
            <div className="bg-primary-light rounded-card p-4 mb-4">
              <div className="text-[12px] font-bold text-primary">Automated Permanent Academic Account Registry</div>
              <p className="text-[11px] text-txt-secondary mt-1 leading-relaxed">
                Your 12-digit academic ID issued by Ministry of Education. We'll verify with your registered DOB.
              </p>
            </div>

            <label className="text-[11px] font-semibold text-txt-secondary uppercase">APAAR ID</label>
            <input
              inputMode="numeric"
              value={apaar.replace(/(\d{4})(?=\d)/g, '$1 ')}
              onChange={e => setApaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="1234 5678 9012"
              className="w-full mt-2 border-2 border-bdr rounded-xl px-3 py-3 text-[15px] tracking-wider outline-none focus:border-primary"
            />

            <label className="text-[11px] font-semibold text-txt-secondary uppercase mt-4 block">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full mt-2 border-2 border-bdr rounded-xl px-3 py-3 text-[14px] outline-none focus:border-primary"
            />

            <p className="text-[10px] text-txt-tertiary mt-3">
              Don't have an APAAR? Visit{' '}
              <span className="text-primary font-semibold">apaar.education.gov.in</span> or check DigiLocker (auto-issued in 7–15 days).
            </p>

            <button
              onClick={() => setStep('verifying')}
              disabled={apaar.length < 12 || !dob}
              className="w-full mt-6 bg-primary text-white font-bold text-[14px] py-3 rounded-pill shadow-card disabled:opacity-40"
            >
              Verify with Ministry of Education
            </button>
          </>
        )}

        {step === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full border-4 border-primary-light border-t-primary animate-spin mb-5" />
            <div className="text-[14px] font-bold text-txt-primary">Verifying APAAR…</div>
            <p className="text-[11px] text-txt-secondary mt-1 text-center max-w-[260px]">
              Cross-checking with Ministry of Education registry
            </p>
          </div>
        )}

        {step === 'success' && (
          <Success
            title="APAAR verified"
            line={`ID: XXXX XXXX ${apaar.slice(-4)}`}
            sub="Your academic and skill records are now linked."
          />
        )}
      </div>
    </FlowShell>
  )
}

// ─── Shared success view ────────────────────────────────────────────────────
function Success({ title, line, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-20 h-20 rounded-full bg-ok-light flex items-center justify-center mb-4 animate-pop">
        <div className="w-14 h-14 rounded-full bg-ok flex items-center justify-center">
          <Check size={32} className="text-white" strokeWidth={3} />
        </div>
      </div>
      <div className="text-[18px] font-extrabold text-txt-primary">{title}</div>
      <div className="text-[12px] text-primary font-semibold mt-1">{line}</div>
      <p className="text-[11px] text-txt-secondary mt-3 text-center max-w-[280px] leading-relaxed">{sub}</p>
    </div>
  )
}
