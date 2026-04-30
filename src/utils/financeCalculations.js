// Lightweight finance helpers for the loans flow.
// All math is illustrative — production loan products must use the lender's
// own amortisation engine and disclose fees / IRR / APR per regulator rules.

export function calculateEMI(principal, annualRatePercent, tenureMonths) {
  const P = Number(principal) || 0
  const n = Number(tenureMonths) || 0
  const r = (Number(annualRatePercent) || 0) / 12 / 100
  if (P <= 0 || n <= 0) return 0
  if (r === 0) return Math.round(P / n)
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  return Math.round(emi)
}

export function totalPayable(principal, annualRatePercent, tenureMonths) {
  const emi = calculateEMI(principal, annualRatePercent, tenureMonths)
  return emi * (Number(tenureMonths) || 0)
}

export function totalInterest(principal, annualRatePercent, tenureMonths) {
  return totalPayable(principal, annualRatePercent, tenureMonths) - (Number(principal) || 0)
}

// EMI affordability — flag if EMI eats > 35 % of expected monthly salary.
export function emiAffordability(emi, expectedMonthlySalary) {
  const ratio = expectedMonthlySalary > 0 ? emi / expectedMonthlySalary : 1
  if (ratio > 0.5)  return { ok: false, level: 'high',     message: 'EMI exceeds 50 % of expected salary — too risky.' }
  if (ratio > 0.35) return { ok: false, level: 'medium',   message: 'EMI exceeds 35 % of expected salary — choose longer tenure.' }
  return { ok: true, level: 'low', message: 'EMI fits comfortably within 35 % of salary.' }
}

export function formatINR(value) {
  return `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`
}
