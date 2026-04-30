// Lightweight, framework-free validators reused across pages.
// Each helper returns true/false; helpers that need to surface a *message*
// also export a `*Message` form so calling pages can show worker-friendly copy.

const trim = v => (v == null ? '' : String(v).trim())

// ── Generic ────────────────────────────────────────────────────────────────
export const isRequired = v => trim(v).length > 0

// ── Indian phone (mobile) ──────────────────────────────────────────────────
// Accepts +91 prefix and various formatting; checks 10-digit body starts 6-9.
export function isValidIndianPhone(value) {
  const digits = trim(value).replace(/\D/g, '').replace(/^91/, '')
  return /^[6-9]\d{9}$/.test(digits)
}
export const phoneMessage = 'Enter a valid 10-digit Indian mobile number.'

// ── Aadhaar ────────────────────────────────────────────────────────────────
const AADHAAR_DUMMIES = new Set([
  '000000000000', '111111111111', '222222222222', '333333333333',
  '444444444444', '555555555555', '666666666666', '777777777777',
  '888888888888', '999999999999', '123456789012',
])
export function isValidAadhaar(value) {
  const digits = trim(value).replace(/\D/g, '')
  if (!/^\d{12}$/.test(digits)) return false
  return !AADHAAR_DUMMIES.has(digits)
}
export const aadhaarMessage = 'Aadhaar must be 12 digits.'

export function maskAadhaar(value) {
  const digits = trim(value).replace(/\D/g, '')
  if (digits.length < 4) return digits
  return `XXXX XXXX ${digits.slice(-4)}`
}

// ── OTP ────────────────────────────────────────────────────────────────────
export function isValidOTP(value, length = 6) {
  const digits = trim(value).replace(/\D/g, '')
  return digits.length === length
}
export const otpMessage = 'Enter the 6-digit OTP.'

// ── Captcha ────────────────────────────────────────────────────────────────
export function isValidCaptcha(input, expected) {
  return trim(input).toLowerCase() === trim(expected).toLowerCase()
}
export const captchaMessage = 'Captcha does not match. Please try again.'

// ── Age / DOB ──────────────────────────────────────────────────────────────
export function getAgeFromDOB(dob) {
  if (!dob) return null
  const d = new Date(dob)
  if (isNaN(+d)) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age
}
export function isAdult(dob, minAge = 18) {
  const age = getAgeFromDOB(dob)
  return age != null && age >= minAge
}
export function isValidDOB(dob, minAge = 18) {
  if (!dob) return false
  const d = new Date(dob)
  if (isNaN(+d)) return false
  if (d > new Date()) return false
  return isAdult(dob, minAge)
}
export const dobMessage = 'You must be at least 18 years old.'

export function isValidAge(value) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 18 && n <= 70
}
export function isReasonableWorkingAge(age) {
  const n = Number(age)
  return Number.isFinite(n) && n >= 18 && n <= 60
}

// ── Name / location ────────────────────────────────────────────────────────
export function isValidName(value) {
  const v = trim(value)
  if (v.length < 2) return false
  return /^[A-Za-z .'-]+$/.test(v)
}
export const nameMessage = 'Use letters only. At least 2 characters.'

export function isValidLocation(value) {
  return trim(value).length >= 3
}
export const locationMessage = 'Location must be at least 3 characters.'

// ── Salary ─────────────────────────────────────────────────────────────────
export function isValidSalary(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0
}

// ── IFSC / UPI / bank account ──────────────────────────────────────────────
export function isValidIFSC(value) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(trim(value).toUpperCase())
}
export const ifscMessage = 'IFSC must be 4 letters + 0 + 6 digits/letters.'

export function isValidUPI(value) {
  return /^[a-z0-9._-]{3,}@[a-z]{2,}$/i.test(trim(value))
}
export const upiMessage = 'UPI ID format: name@bank'

export function isValidBankAccount(value) {
  const digits = trim(value).replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 18
}
export const bankAccountMessage = 'Account number must be 9–18 digits.'

// ── Grievance description ──────────────────────────────────────────────────
export function isValidDescription(value, min = 20) {
  return trim(value).length >= min
}

// ── Helpers used by forms ──────────────────────────────────────────────────
// Run a map of field → validator and return { isValid, errors }.
export function validateForm(values, validators) {
  const errors = {}
  for (const key of Object.keys(validators)) {
    const result = validators[key](values[key], values)
    if (result === true) continue
    errors[key] = typeof result === 'string' ? result : 'Required'
  }
  return { isValid: Object.keys(errors).length === 0, errors }
}
