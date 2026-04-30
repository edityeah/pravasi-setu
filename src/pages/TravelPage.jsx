import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import Stepper from '../components/Stepper'
import StatusChip from '../components/StatusChip'
import AlertBanner from '../components/AlertBanner'
import Timeline from '../components/Timeline'
import { AIRPORTS, FLIGHT_PROVIDERS, TRAVEL_PAYMENT_METHODS } from '../data/mockData'
import { formatINR } from '../utils/financeCalculations'
import {
  Plane, ChevronLeft, ChevronRight, CheckCircle2, Send, BellRing, Download, Share2,
  Clock, ArrowRight, Calendar, User as UserIcon, Mail, Phone, BadgeCheck, AlertTriangle,
} from 'lucide-react'
import { isValidIndianPhone, isValidName } from '../utils/validation'

/* Travel flow — Search → Options → Passenger → Payment → Confirmation.
   params.bookingId opens detail of an existing booking; params.mode='list' opens My Travel.
   See PRAVASI_New_Features_Product_Spec.md §10. All providers are mock. */

const STEP_LABELS = ['Search', 'Options', 'Passenger', 'Pay', 'Done']
const BOOKING_STATUSES = {
  PAYMENT_PENDING: { tone: 'warning', label: 'Payment pending' },
  TICKET_ISSUED:   { tone: 'success', label: 'Ticket issued' },
  CANCELLED:       { tone: 'error',   label: 'Cancelled' },
  COMPLETED:       { tone: 'success', label: 'Completed' },
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim())
}

export default function TravelPage() {
  const { travelBookings, addTravelBooking, navigate, params, profile, showToast } = useApp()
  const focused = params?.bookingId ? travelBookings.find(b => b.id === params.bookingId) : null

  if (focused) return <BookingDetail booking={focused} navigate={navigate} showToast={showToast} />
  if (params?.mode === 'list') return <MyTravelView bookings={travelBookings} navigate={navigate} />

  return <BookingWizard
    bookings={travelBookings}
    addTravelBooking={addTravelBooking}
    profile={profile}
    initialFrom={params?.from}
    initialTo={params?.to}
    navigate={navigate}
    showToast={showToast}
  />
}

function MyTravelView({ bookings, navigate }) {
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="My Travel" sub={`${bookings.length} booking${bookings.length === 1 ? '' : 's'}`} />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6">
        <div className="max-w-screen-lg mx-auto w-full space-y-3">
          {bookings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-6 text-center">
              <Plane size={36} className="text-primary mx-auto mb-2" />
              <div className="text-[14px] font-bold text-txt-primary">No tickets yet</div>
              <p className="text-[12px] text-txt-secondary mt-1">Find flight options to your destination and book in a few taps.</p>
              <button onClick={() => navigate('travel')} className="mt-4 bg-primary text-white font-bold text-[13px] px-5 py-2.5 rounded-pill hover:bg-primary-dark transition-colors">
                Find flights
              </button>
            </div>
          )}
          {bookings.map(b => {
            const meta = BOOKING_STATUSES[b.status] || { tone: 'neutral', label: b.status }
            return (
              <button key={b.id} onClick={() => navigate('travel', { bookingId: b.id })}
                className="w-full bg-white rounded-2xl shadow-card border border-bdr-light p-4 text-left hover:border-primary hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-txt-tertiary uppercase">{b.id}</div>
                  <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                    <Plane size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-txt-primary truncate">{b.from} → {b.to}</div>
                    <div className="text-[11px] text-txt-secondary">{b.airline} · {b.departureDate} · PNR {b.pnr}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-extrabold text-primary">{formatINR(b.fare)}</div>
                    <div className="text-[10px] text-txt-tertiary">{b.duration}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BookingWizard({ bookings, addTravelBooking, profile, initialFrom, initialTo, navigate, showToast }) {
  const [step, setStep] = useState(0)

  const today = new Date().toISOString().slice(0, 10)
  const inAWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  // Step 0 — search
  const [from, setFrom] = useState(initialFrom || 'LKO')
  const [to,   setTo]   = useState(initialTo   || 'DXB')
  const [departureDate, setDepartureDate] = useState(inAWeek)
  const [returnDate,    setReturnDate]    = useState('')
  const [errors, setErrors] = useState({})

  // Step 1 — flight options
  const flightOptions = useMemo(() => buildFlightOptions(from, to, departureDate), [from, to, departureDate])
  const [flightId, setFlightId] = useState(null)
  const flight = flightOptions.find(f => f.id === flightId)

  // Step 2 — passenger details
  const [passenger, setPassenger] = useState({
    name:  profile?.name  || '',
    phone: profile?.phone || '',
    email: '',
    idType: 'Passport',
    idNumber: '',
    emergencyContact: '',
  })
  const passengerErrors = {
    name:     !isValidName(passenger.name)         ? 'Enter the passenger name as on ID.' : null,
    phone:    !isValidIndianPhone(passenger.phone) ? 'Enter a valid 10-digit Indian mobile number.' : null,
    email:    !isValidEmail(passenger.email)       ? 'Enter a valid email address.' : null,
    idNumber: passenger.idNumber.trim().length < 6 ? 'Enter your passport / ID number.' : null,
  }
  const passengerValid = Object.values(passengerErrors).every(e => !e)

  // Step 3 — payment
  const [paymentMethod, setPaymentMethod] = useState('upi')

  const validateSearch = () => {
    const e = {}
    if (!from)             e.from = 'Pick origin airport.'
    if (!to)               e.to   = 'Pick destination airport.'
    if (from === to)       e.to   = 'Origin and destination cannot be the same.'
    if (!departureDate)    e.departureDate = 'Pick departure date.'
    if (departureDate < today) e.departureDate = 'Departure cannot be in the past.'
    if (returnDate && returnDate < departureDate) e.returnDate = 'Return must be after departure.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!flight) return
    const id = `BK-${4000 + bookings.length + 1}`
    const pnr = `${(Math.random().toString(36).slice(2, 8)).toUpperCase()}`
    const issuedAt = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    addTravelBooking({
      id,
      pnr,
      from: `${from} ${airportLabel(from)}`,
      to:   `${to} ${airportLabel(to)}`,
      fromCode: from,
      toCode: to,
      airline: flight.airline,
      provider: flight.provider,
      providerTag: flight.providerTag,
      departureDate,
      returnDate: returnDate || null,
      duration: flight.duration,
      stops: flight.stops,
      baggage: flight.baggage,
      refundable: flight.refundable,
      fare: flight.fare,
      paymentMethod,
      issuedOn: issuedAt,
      status: 'TICKET_ISSUED',
      passenger,
      timeline: [
        { step: 'Search completed',         date: issuedAt, done: true },
        { step: 'Passenger details added',  date: issuedAt, done: true },
        { step: 'Payment completed',        date: issuedAt, done: true },
        { step: 'Ticket issued',            date: issuedAt, done: true, current: true },
        { step: 'Reminder T-3 days',        date: 'Scheduled', done: false },
        { step: 'Reminder T-1 day',         date: 'Scheduled', done: false },
      ],
      alerts: [
        { id: 'a1', when: 'T-3 days', channel: 'sms',      message: 'Your flight to ' + airportLabel(to) + ' is in 3 days. Check passport, visa & GAMCA medical.' },
        { id: 'a2', when: 'T-1 day',  channel: 'whatsapp', message: 'Reminder: flight tomorrow from ' + airportLabel(from) + '. Reach airport 3 hr before departure.' },
      ],
    })
    showToast(`Ticket ${id} issued · PNR ${pnr}`)
    setStep(4)
    setTimeout(() => navigate('travel', { bookingId: id }), 1200)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar
        title="Book travel"
        sub={`Step ${Math.min(step + 1, 4)} of 4`}
        dark
        onBack={step > 0 && step < 4 ? () => setStep(s => s - 1) : undefined}
      />

      <div className="bg-primary px-4 pb-4">
        <div className="max-w-screen-lg mx-auto w-full">
          <Stepper steps={STEP_LABELS.slice(0, 4)} current={Math.min(step, 3)} className="text-white [&_*]:!text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 mt-3 space-y-3">
          {step === 0 && (
            <SearchStep
              from={from} setFrom={setFrom}
              to={to}     setTo={setTo}
              departureDate={departureDate} setDepartureDate={setDepartureDate}
              returnDate={returnDate} setReturnDate={setReturnDate}
              errors={errors}
              today={today}
            />
          )}
          {step === 1 && (
            <OptionsStep
              flightOptions={flightOptions}
              flightId={flightId}
              setFlightId={setFlightId}
              from={from} to={to} departureDate={departureDate}
            />
          )}
          {step === 2 && (
            <PassengerStep
              passenger={passenger}
              setPassenger={setPassenger}
              errors={passengerErrors}
            />
          )}
          {step === 3 && flight && (
            <PaymentStep
              flight={flight}
              passenger={passenger}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              from={from} to={to} departureDate={departureDate}
            />
          )}
          {step === 4 && (
            <div className="bg-white rounded-2xl shadow-modal border border-bdr-light p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-ok-light flex items-center justify-center animate-pop">
                <div className="w-12 h-12 rounded-full bg-ok flex items-center justify-center">
                  <CheckCircle2 size={26} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="text-[18px] font-extrabold text-txt-primary mt-3">Ticket issued</div>
              <p className="text-[12px] text-txt-secondary mt-1">Opening your travel tracker…</p>
            </div>
          )}
        </div>
      </div>

      {step < 4 && (
        <div className="px-4 py-3 border-t border-bdr-light bg-white flex-shrink-0">
          <div className="max-w-screen-lg mx-auto w-full flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-4 rounded-pill bg-surface-secondary text-txt-secondary font-bold text-[13px] flex items-center gap-1">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step === 0 && (
              <button onClick={() => { if (validateSearch()) setStep(1) }}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2">
                Show flight options <ChevronRight size={16} />
              </button>
            )}
            {step === 1 && (
              <button onClick={() => flightId && setStep(2)} disabled={!flightId}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200">
                Continue <ChevronRight size={16} />
              </button>
            )}
            {step === 2 && (
              <button onClick={() => passengerValid && setStep(3)} disabled={!passengerValid}
                className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 disabled:bg-primary-200">
                Review & pay <ChevronRight size={16} />
              </button>
            )}
            {step === 3 && (
              <button onClick={submit} className="flex-1 bg-primary text-white font-bold text-[14px] py-3 rounded-pill flex items-center justify-center gap-2 shadow-modal">
                <Send size={16} /> Pay {formatINR(flight?.fare || 0)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── Steps ──────────────────────────────────── */

function SearchStep({ from, setFrom, to, setTo, departureDate, setDepartureDate, returnDate, setReturnDate, errors, today }) {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[15px] font-extrabold text-txt-primary">Find flights</div>
        <p className="text-[11px] text-txt-secondary mt-0.5">Origin/destination airport, departure date — we'll show provider options.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <Field label="Flying from" error={errors.from}>
            <select value={from} onChange={e => setFrom(e.target.value)} className={selectCls(errors.from)}>
              {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.code} · {a.city}, {a.country}</option>)}
            </select>
          </Field>
          <Field label="Flying to" error={errors.to}>
            <select value={to} onChange={e => setTo(e.target.value)} className={selectCls(errors.to)}>
              {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.code} · {a.city}, {a.country}</option>)}
            </select>
          </Field>
          <Field label="Departure date" error={errors.departureDate}>
            <input type="date" value={departureDate} min={today} onChange={e => setDepartureDate(e.target.value)} className={selectCls(errors.departureDate)} />
          </Field>
          <Field label="Return date (optional)" error={errors.returnDate}>
            <input type="date" value={returnDate} min={departureDate || today} onChange={e => setReturnDate(e.target.value)} className={selectCls(errors.returnDate)} />
          </Field>
        </div>
      </div>

      <AlertBanner tone="info" title="Document check before payment">
        Verify passport validity (6+ months), visa and any health requirements. We show flight options that match common migrant routes.
      </AlertBanner>
    </>
  )
}

function OptionsStep({ flightOptions, flightId, setFlightId, from, to, departureDate }) {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-extrabold text-txt-primary">{from} → {to}</div>
            <div className="text-[11px] text-txt-secondary">{departureDate} · {flightOptions.length} options</div>
          </div>
          <span className="text-[10px] font-bold text-txt-tertiary uppercase">Sorted by best value</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 mt-4">
          {flightOptions.map(f => {
            const active = flightId === f.id
            return (
              <button key={f.id} onClick={() => setFlightId(f.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                  active ? 'border-primary bg-primary-50' : 'border-bdr bg-white hover:border-primary'
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[14px] font-bold text-txt-primary">{f.airline}</div>
                    <div className="text-[10px] text-txt-secondary">{f.provider} · {f.providerTag}</div>
                  </div>
                  {f.badge && <span className="px-1.5 py-0.5 rounded-pill bg-primary-50 text-primary text-[9px] font-bold">{f.badge}</span>}
                </div>
                <div className="flex items-center gap-2 mt-3 text-[12px] font-bold text-txt-primary">
                  <span>{f.departure}</span>
                  <ArrowRight size={14} className="text-txt-tertiary" />
                  <span>{f.arrival}</span>
                  <span className="ml-auto text-[14px] text-primary">{formatINR(f.fare)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                  <KV k="Duration" v={f.duration} />
                  <KV k="Stops"    v={f.stops === 0 ? 'Non-stop' : `${f.stops} stop`} />
                  <KV k="Baggage"  v={f.baggage} />
                </div>
                <div className="text-[10px] text-txt-tertiary mt-1">{f.refundable ? 'Partial refund' : 'Non-refundable'}</div>
              </button>
            )
          })}
        </div>
      </div>

      <AlertBanner tone="warning" title="Document check required">
        Real production travel must validate passport / visa / health requirements through trusted sources (e.g. IATA Timatic). This prototype simulates issuance.
      </AlertBanner>
    </>
  )
}

function PassengerStep({ passenger, setPassenger, errors }) {
  const update = (k, v) => setPassenger(p => ({ ...p, [k]: v }))
  return (
    <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
      <div className="text-[15px] font-extrabold text-txt-primary">Passenger details</div>
      <p className="text-[11px] text-txt-secondary mt-0.5">Used for ticketing and journey alerts. Your profile values are pre-filled.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <Field label="Full name (as on passport)" icon={UserIcon} error={errors.name}>
          <input value={passenger.name} onChange={e => update('name', e.target.value)} className={selectCls(errors.name)} placeholder="As on ID" />
        </Field>
        <Field label="Phone" icon={Phone} error={errors.phone}>
          <input inputMode="numeric" value={passenger.phone} onChange={e => update('phone', e.target.value)} className={selectCls(errors.phone)} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email" icon={Mail} error={errors.email}>
          <input type="email" value={passenger.email} onChange={e => update('email', e.target.value)} className={selectCls(errors.email)} placeholder="you@example.com" />
        </Field>
        <Field label="ID type">
          <select value={passenger.idType} onChange={e => update('idType', e.target.value)} className={selectCls()}>
            {['Passport', 'Aadhaar', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label={`${passenger.idType} number`} icon={BadgeCheck} error={errors.idNumber}>
          <input value={passenger.idNumber} onChange={e => update('idNumber', e.target.value)} className={selectCls(errors.idNumber)} placeholder="Document number" />
        </Field>
        <Field label="Emergency contact (optional)">
          <input value={passenger.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} className={selectCls()} placeholder="Family member phone" />
        </Field>
      </div>
    </div>
  )
}

function PaymentStep({ flight, passenger, paymentMethod, setPaymentMethod, from, to, departureDate }) {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[15px] font-extrabold text-txt-primary">Choose payment method</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          {TRAVEL_PAYMENT_METHODS.map(m => {
            const active = paymentMethod === m.id
            return (
              <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                  active ? 'border-primary bg-primary-50' : 'border-bdr bg-white hover:border-primary'
                }`}>
                <div className="text-[22px]">{m.icon}</div>
                <div className="text-[13px] font-bold text-txt-primary mt-1">{m.label}</div>
                <div className="text-[10px] text-txt-secondary">{m.note}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
        <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Trip review</div>
        <Row k="Route"          v={`${from} → ${to}`} />
        <Row k="Date"           v={departureDate} />
        <Row k="Airline"        v={flight.airline} />
        <Row k="Duration"       v={flight.duration} />
        <Row k="Baggage"        v={flight.baggage} />
        <Row k="Passenger"      v={passenger.name} />
        <Row k="Fare (final)"   v={formatINR(flight.fare)} highlight />
      </div>

      <AlertBanner tone="info" title="Reminders included">
        We'll schedule SMS / WhatsApp alerts 3 days and 1 day before your journey — passport, visa & GAMCA medical reminders included.
      </AlertBanner>
    </>
  )
}

/* ───────────────────────── Booking detail ─────────────────────────── */
function BookingDetail({ booking, navigate, showToast }) {
  const meta = BOOKING_STATUSES[booking.status] || { tone: 'neutral', label: booking.status }
  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar dark />
      <TopBar
        title={`PNR ${booking.pnr}`}
        sub={`${booking.fromCode} → ${booking.toCode}`}
        dark
        actions={[
          { icon: <Share2 size={18} />,   onClick: () => showToast('Ticket shared') },
          { icon: <Download size={18} />, onClick: () => showToast('Ticket PDF downloaded') },
        ]}
      />

      <div className="bg-primary text-white px-5 pb-6">
        <div className="max-w-screen-lg mx-auto w-full">
          <StatusChip tone={meta.tone === 'neutral' ? 'brand' : meta.tone}>{meta.label}</StatusChip>
          <div className="text-[24px] font-extrabold mt-2 leading-tight">{booking.airline}</div>
          <div className="text-[12px] opacity-90">{booking.from.split(' ')[0]} → {booking.to.split(' ')[0]} · {booking.departureDate} · {booking.duration}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 mt-3 space-y-3">
          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Itinerary</div>
            <Row k="From"           v={booking.from} />
            <Row k="To"             v={booking.to} />
            <Row k="Departure"      v={booking.departureDate} />
            {booking.returnDate && <Row k="Return" v={booking.returnDate} />}
            <Row k="Duration"       v={booking.duration} />
            <Row k="Stops"          v={booking.stops === 0 ? 'Non-stop' : `${booking.stops} stop`} />
            <Row k="Baggage"        v={booking.baggage} />
            <Row k="Fare paid"      v={formatINR(booking.fare)} highlight />
            <Row k="Provider"       v={`${booking.provider} (${booking.providerTag})`} />
            <Row k="Payment"        v={booking.paymentMethod} />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Passenger</div>
            <Row k="Name"     v={booking.passenger?.name} />
            <Row k="Phone"    v={booking.passenger?.phone} />
            <Row k="Email"    v={booking.passenger?.email} />
            <Row k="ID"       v={`${booking.passenger?.idType} · ${booking.passenger?.idNumber}`} />
            {booking.passenger?.emergencyContact && <Row k="Emergency contact" v={booking.passenger.emergencyContact} />}
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3">Timeline</div>
            <Timeline items={booking.timeline || []} />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-bdr-light p-5">
            <div className="text-[12px] font-bold text-txt-secondary uppercase mb-3 flex items-center gap-2">
              <BellRing size={14} className="text-primary" /> Travel reminders
            </div>
            <div className="space-y-2">
              {(booking.alerts || []).map(a => (
                <div key={a.id} className="p-3 rounded-card border border-bdr">
                  <div className="text-[12px] font-bold text-txt-primary">{a.when} · via {a.channel}</div>
                  <p className="text-[11px] text-txt-secondary mt-1">{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── helpers ────────────────────────────────── */
function airportLabel(code) {
  const a = AIRPORTS.find(x => x.code === code)
  return a ? `${a.city}` : code
}

// Generate 5 mock flight options for a given route. Deterministic-ish so
// repeat searches feel stable.
function buildFlightOptions(from, to, date) {
  if (!from || !to || from === to) return []
  const seed = (from + to + date).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const rng = (i) => ((seed * (i + 1) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  const opts = []
  for (let i = 0; i < FLIGHT_PROVIDERS.length; i++) {
    const p = FLIGHT_PROVIDERS[i]
    const dep = new Date(date + 'T00:00:00')
    dep.setHours(6 + Math.floor(rng(i) * 14))
    dep.setMinutes(Math.floor(rng(i + 1) * 12) * 5)
    const durMins = 240 + Math.floor(rng(i + 2) * 240)
    const arr = new Date(dep.getTime() + durMins * 60_000)
    const stops = rng(i + 3) > 0.6 ? 1 : 0
    const fare = 16000 + Math.floor(rng(i + 4) * 12000) + (p.id === 'emirates' ? 4000 : 0)
    const baggage = rng(i + 5) > 0.5 ? '30 kg' : '25 kg'
    const refundable = rng(i + 6) > 0.6
    let badge = null
    if (i === 0) badge = 'Best value'
    else if (i === 1) badge = 'Fastest'
    else if (p.tag === 'Integration-ready') badge = 'Aggregator'
    opts.push({
      id: `${p.id}-${i}`,
      provider: p.name,
      providerTag: p.tag,
      airline: p.airline,
      departure: dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      arrival:   arr.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      duration: `${Math.floor(durMins / 60)}h ${durMins % 60}m`,
      stops,
      fare,
      baggage,
      refundable,
      badge,
    })
  }
  return opts.sort((a, b) => a.fare - b.fare)
}

const selectCls = (err) =>
  `w-full mt-1 border-2 rounded-xl px-3 py-3 text-[13px] outline-none bg-white ${
    err ? 'border-danger' : 'border-bdr focus:border-primary'
  }`

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-txt-secondary uppercase flex items-center gap-1">
        {Icon && <Icon size={12} />} {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-danger font-medium mt-1">{error}</p>}
    </div>
  )
}
function Row({ k, v, highlight }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-2 border-b border-bdr-light last:border-0 ${highlight ? 'bg-primary-50 -mx-2 px-2 rounded-lg border-0' : ''}`}>
      <span className="text-[12px] text-txt-secondary">{k}</span>
      <span className={`text-[13px] font-bold text-right ${highlight ? 'text-primary' : 'text-txt-primary'}`}>{v}</span>
    </div>
  )
}
function KV({ k, v, highlight }) {
  return (
    <div className={`rounded-lg p-2 ${highlight ? 'bg-primary-50' : 'bg-surface-secondary'}`}>
      <div className="text-[9px] uppercase font-bold text-txt-tertiary">{k}</div>
      <div className={`text-[12px] font-bold ${highlight ? 'text-primary' : 'text-txt-primary'}`}>{v}</div>
    </div>
  )
}
