import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import {
  User, Phone, MapPin, GraduationCap, Wrench, Plus, X, Check, ArrowRight, Sparkles, ShieldCheck, Calendar
} from 'lucide-react'
import {
  isValidName, nameMessage, isValidIndianPhone, phoneMessage,
  isValidLocation, locationMessage, isValidDOB, dobMessage, getAgeFromDOB,
} from '../utils/validation'

const SKILL_OPTIONS = [
  'Electrician', 'Plumbing', 'Welding', 'Carpentry', 'Mason', 'Driver', 'Helper',
  'Housekeeping', 'Cook', 'Nursing', 'Beautician', 'AC Technician', 'Security Guard'
]
const EDU_OPTIONS = ['Below 10th', '10th Pass', '12th Pass', 'ITI / Diploma', 'Graduate', 'Post-graduate']
const STEPS = ['Basic', 'Education', 'Skills', 'Preferences', 'Review']

export default function ProfileSetupPage() {
  const { profile, setProfile, navigate, showToast } = useApp()
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState({})
  const [form, setForm] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    dob: profile.dob || '',
    gender: profile.gender || 'Male',
    location: profile.location || '',
    education: profile.education || '10th Pass',
    skills: profile.skills?.map(s => s.name) || [],
    customSkill: '',
    preferredCountry: 'UAE',
    preferredSalary: 50000,
  })

  const computedAge = getAgeFromDOB(form.dob)
  const errors = {
    name:     !isValidName(form.name)               ? nameMessage     : null,
    phone:    !isValidIndianPhone(form.phone)       ? phoneMessage    : null,
    dob:      !isValidDOB(form.dob)                 ? dobMessage      : null,
    location: !isValidLocation(form.location)       ? locationMessage : null,
  }
  const showErr = (k) => touched[k] && errors[k]
  const markTouched = (k) => setTouched(t => ({ ...t, [k]: true }))

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleSkill = (s) => setForm(f => ({
    ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }))
  const addCustom = () => {
    if (!form.customSkill.trim()) return
    setForm(f => ({ ...f, skills: [...new Set([...f.skills, f.customSkill.trim()])], customSkill: '' }))
  }

  const finish = () => {
    setProfile(p => ({
      ...p,
      name: form.name,
      phone: form.phone,
      dob: form.dob,
      age: computedAge ?? p.age,
      gender: form.gender,
      location: form.location,
      education: form.education,
      skills: form.skills.map(name => {
        const existing = p.skills?.find(x => x.name === name)
        return existing || { name, level: 'Beginner', verified: false, years: 1 }
      }),
    }))
    showToast('Profile saved · Verified employers can now contact you')
    navigate('passport')
  }

  const canNext = (() => {
    if (step === 0) return !errors.name && !errors.phone && !errors.dob && !errors.location
    if (step === 1) return !!form.education
    if (step === 2) return form.skills.length > 0
    if (step === 3) return !!form.preferredCountry
    return true
  })()

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="Create your profile" sub={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`} />

      <div className="px-4 pt-3 flex justify-center">
        <div className="w-full max-w-[560px] flex gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-bdr'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex justify-center px-4 py-4 pb-28">
        <div className="w-full max-w-[560px]">
        {step === 0 && (
          <Section title="Tell us about yourself" sub="This builds your verified migrant profile">
            <Field label="Full name" icon={User} error={showErr('name')}>
              <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                onBlur={() => markTouched('name')}
                className={inputCls(showErr('name'))}
                placeholder="As per Aadhaar"
              />
            </Field>
            <Field label="Phone" icon={Phone} error={showErr('phone')}>
              <input
                inputMode="numeric"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                onBlur={() => markTouched('phone')}
                className={inputCls(showErr('phone'))}
                placeholder="+91 98765 43210"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of birth" icon={Calendar} error={showErr('dob')}>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => update('dob', e.target.value)}
                  onBlur={() => markTouched('dob')}
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputCls(showErr('dob'))}
                />
              </Field>
              <Field label="Gender">
                <select value={form.gender} onChange={e => update('gender', e.target.value)} className={inputCls()}>
                  {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>
            <Field label={`Age${computedAge != null ? ` · ${computedAge} yrs (auto-calculated)` : ''}`}>
              <input value={computedAge ?? ''} readOnly placeholder="Filled from DOB"
                className={`${inputCls()} bg-surface-secondary text-txt-secondary`} />
            </Field>
            <Field label="Home district / state" icon={MapPin} error={showErr('location')}>
              <input
                value={form.location}
                onChange={e => update('location', e.target.value)}
                onBlur={() => markTouched('location')}
                className={inputCls(showErr('location'))}
                placeholder="Lucknow, Uttar Pradesh"
              />
            </Field>
          </Section>
        )}

        {step === 1 && (
          <Section title="Education" sub="Pick the highest level you've completed">
            {EDU_OPTIONS.map(o => (
              <button
                key={o}
                onClick={() => update('education', o)}
                className={`w-full flex items-center gap-3 p-3 rounded-card border-2 mb-2 text-left ${
                  form.education === o ? 'border-primary bg-primary-light' : 'border-bdr bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                  <GraduationCap size={16} className="text-primary" />
                </div>
                <span className="text-[13px] font-bold text-txt-primary flex-1">{o}</span>
                {form.education === o && <Check size={16} className="text-primary" />}
              </button>
            ))}
          </Section>
        )}

        {step === 2 && (
          <Section title="What can you do?" sub="Pick all skills that apply — boosts job matches">
            <div className="flex flex-wrap gap-2 mb-3">
              {SKILL_OPTIONS.map(s => {
                const on = form.skills.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-pill text-[12px] font-semibold border ${
                      on ? 'bg-primary text-white border-primary' : 'bg-white text-txt-secondary border-bdr'
                    }`}
                  >
                    {on ? '✓ ' : '+ '}{s}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={form.customSkill}
                onChange={e => update('customSkill', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Add another skill"
                className={INPUT}
              />
              <button onClick={addCustom} className="px-4 rounded-pill bg-primary text-white text-[12px] font-bold">Add</button>
            </div>
            {form.skills.length > 0 && (
              <div className="mt-3 p-3 bg-ok-light rounded-xl">
                <div className="text-[11px] text-ok font-bold mb-1">Selected ({form.skills.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[11px] font-semibold text-txt-primary">
                      {s} <X size={10} className="cursor-pointer text-txt-tertiary" onClick={() => toggleSkill(s)} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {step === 3 && (
          <Section title="Where do you want to work?" sub="We'll prioritise these in your job feed">
            <Field label="Preferred destination">
              <select value={form.preferredCountry} onChange={e => update('preferredCountry', e.target.value)} className={INPUT}>
                {['UAE','Saudi Arabia','Qatar','Kuwait','Oman'].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label={`Minimum monthly salary expected: ₹${(+form.preferredSalary).toLocaleString()}`}>
              <input
                type="range" min={20000} max={150000} step={5000}
                value={form.preferredSalary}
                onChange={e => update('preferredSalary', +e.target.value)}
                className="w-full accent-primary"
              />
            </Field>
            <div className="mt-3 p-3 bg-info-light rounded-xl flex items-start gap-2">
              <Sparkles size={14} className="text-info mt-0.5" />
              <p className="text-[11px] text-info leading-relaxed">
                We'll alert you when verified jobs above your threshold open. You can edit these later.
              </p>
            </div>
          </Section>
        )}

        {step === 4 && (
          <Section title="Review & save" sub="Tap Finish to publish your verified profile">
            <Card>
              <Row label="Name"      value={form.name} />
              <Row label="Phone"     value={form.phone} />
              <Row label="Age · Gender" value={`${computedAge ?? '—'} · ${form.gender}`} />
              <Row label="Home"      value={form.location} />
              <Row label="Education" value={form.education} />
              <Row label="Skills"    value={form.skills.join(', ') || '—'} />
              <Row label="Prefers"   value={`${form.preferredCountry} · ₹${(+form.preferredSalary).toLocaleString()}+`} />
            </Card>
            <div className="mt-3 p-3 bg-ok-light rounded-xl flex items-start gap-2">
              <ShieldCheck size={16} className="text-ok mt-0.5" />
              <p className="text-[11px] text-ok leading-relaxed">
                Your Aadhaar / DigiLocker linkage gives you a Verified Migrant badge — visible to employers.
              </p>
            </div>
          </Section>
        )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-bdr-light bg-white flex gap-2 flex-shrink-0 max-w-[560px] mx-auto w-full">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="px-5 rounded-pill bg-surface-secondary text-txt-secondary font-bold text-[13px]">Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => {
              if (step === 0) setTouched({ name: true, phone: true, dob: true, location: true })
              if (canNext) setStep(s => s + 1)
            }}
            disabled={!canNext}
            className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200 disabled:cursor-not-allowed"
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={finish} className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2">
            <Check size={16} /> Finish & Open Skill Passport
          </button>
        )}
      </div>
    </div>
  )
}

const INPUT = 'w-full mt-1 border-2 border-bdr rounded-xl px-3 py-3 text-[13px] outline-none focus:border-primary bg-white'

function inputCls(hasError) {
  return `w-full mt-1 border-2 rounded-xl px-3 py-3 text-[13px] outline-none bg-white ${
    hasError ? 'border-danger' : 'border-bdr focus:border-primary'
  }`
}

function Section({ title, sub, children }) {
  return (
    <div>
      <div className="text-[15px] font-extrabold text-txt-primary">{title}</div>
      {sub && <p className="text-[11px] text-txt-secondary mt-0.5 mb-3">{sub}</p>}
      {children}
    </div>
  )
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="mb-3">
      <label className="text-[11px] font-semibold text-txt-secondary uppercase flex items-center gap-1">
        {Icon && <Icon size={12} />} {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-danger font-medium mt-1">{error}</p>}
    </div>
  )
}

function Card({ children }) {
  return <div className="bg-white rounded-card shadow-card p-4 space-y-2">{children}</div>
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between text-[12px] gap-2">
      <span className="text-txt-secondary">{label}</span>
      <span className="font-semibold text-txt-primary text-right">{value || '—'}</span>
    </div>
  )
}
