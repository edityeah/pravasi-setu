import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/BottomNav'
import { JOBS, SUGGESTED_PROMPTS } from '../data/mockData'
import {
  Mic, Send, Bot, ChevronRight, Briefcase, AlertTriangle, Calculator, Send as SendIcon,
  ShieldCheck, Phone, FileBadge, User as UserIcon, Award, Building2, Wallet,
  Plane, Home as HomeIcon, RotateCcw, MessageCircle, Stethoscope, Languages, Receipt,
} from 'lucide-react'

const INITIAL = [
  { from: 'bot', kind: 'text', text: '🙏 Namaste! I\'m Setu — your migration assistant. Ask me about jobs, money transfers, costs, documents or emergencies. Voice + text in 6 languages.' },
  { from: 'bot', kind: 'suggestions' },
]

// Intent rules — each entry has keyword tests + reply builder.
// Keyword matching is intentionally loose so multi-word BRD prompts hit reliably.
function buildIntents(JOBS) {
  return [
    {
      keys: ['create my profile', 'profile setup', 'make profile', 'create profile', 'register me', 'sign up'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Let\'s build your verified migrant profile in 5 quick steps.' },
        { from: 'bot', kind: 'action', label: 'Open Profile Setup', icon: UserIcon, target: 'profileSetup' },
      ],
    },
    {
      keys: ['add my skills', 'add skill', 'update skill'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Add your skills inside the Skill Passport. Verified employers see you faster when skills match.' },
        { from: 'bot', kind: 'action', label: 'Open Skill Passport', icon: Award, target: 'passport' },
      ],
    },
    {
      keys: ['create my resume', 'edit my resume', 'build my resume', 'open resume builder', 'resume builder'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Resume Builder lets you edit every section of your skill passport, preview an A4 layout and download a Pravasi-branded PDF.' },
        { from: 'bot', kind: 'action', label: 'Open Resume Builder', icon: FileBadge, target: 'resumeBuilder' },
      ],
    },
    {
      keys: ['download my resume', 'export resume', 'resume pdf'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Tap the Download button on Resume Builder — your browser will save a PDF named Pravasi_Setu_Resume_{your_name}.pdf.' },
        { from: 'bot', kind: 'action', label: 'Download from Resume Builder', icon: FileBadge, target: 'resumeBuilder' },
      ],
    },
    {
      keys: ['add education', 'add my education'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open Resume Builder → Education to add your highest qualification, institution and year.' },
        { from: 'bot', kind: 'action', label: 'Add education', icon: FileBadge, target: 'resumeBuilder' },
      ],
    },
    {
      keys: ['add work experience', 'add experience', 'add job history'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open Resume Builder → Work experience. Add title, company, country, duration and responsibilities.' },
        { from: 'bot', kind: 'action', label: 'Add experience', icon: FileBadge, target: 'resumeBuilder' },
      ],
    },
    {
      keys: ['add certificate', 'upload certificate'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open Resume Builder → Certifications. Tag verified ones — they appear with a green badge in your resume.' },
        { from: 'bot', kind: 'action', label: 'Add certificate', icon: FileBadge, target: 'resumeBuilder' },
      ],
    },
    {
      keys: ['show my skill passport', 'open skill passport', 'skill passport'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Your Skill Passport shows verified skills, certificates, work history and a readiness score.' },
        { from: 'bot', kind: 'action', label: 'Open Skill Passport', icon: Award, target: 'passport' },
      ],
    },
    {
      keys: ['share my profile', 'share resume', 'share skill passport'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open the Skill Passport → tap Share to copy a verifiable link, or download the PDF resume from Resume Builder.' },
        { from: 'bot', kind: 'action', label: 'Open Skill Passport', icon: Award, target: 'passport' },
      ],
    },
    {
      keys: ['apply with my resume', 'apply with my profile', 'use my resume to apply'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open any job and tap Apply Now → Swift Apply uses your verified Pravasi resume in one tap.' },
        { from: 'bot', kind: 'action', label: 'Browse jobs', icon: Briefcase, target: 'jobs' },
      ],
    },
    {
      keys: ['upload certificate', 'add certificate', 'upload cert', 'add cert'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Upload it via DigiLocker — we cross-verify with the issuer (NCVT, NSDC, CBSE etc.) and put it on-chain.' },
        { from: 'bot', kind: 'action', label: 'Open Skill Passport', icon: FileBadge, target: 'passport' },
      ],
    },
    {
      keys: ['document verified', 'is my document', 'is verified', 'verification status'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Your ITI Electrician (NCVT) and NSDC Level 4 are verified. Your CIPET Welding Safety is awaiting issuer confirmation.' },
        { from: 'bot', kind: 'action', label: 'View certificate status', icon: ShieldCheck, target: 'certificate', params: { certId: 'cert-weld' } },
      ],
    },
    {
      keys: ['find jobs in dubai', 'jobs in dubai', 'dubai job'],
      reply: () => [
        { from: 'bot', kind: 'text', text: `I found ${JOBS.filter(j => j.destinationCity === 'Dubai').length} verified jobs in Dubai. Top matches:` },
        { from: 'bot', kind: 'jobCards', items: JOBS.filter(j => j.destinationCity === 'Dubai').slice(0, 3) },
      ],
    },
    {
      keys: ['salary for nurses in qatar', 'salary nurse qatar', 'nurse salary qatar', 'staff nurse qatar'],
      reply: () => {
        const matches = JOBS.filter(j => j.title === 'Staff Nurse' && j.destinationCountry === 'Qatar')
        if (matches.length) {
          const min = Math.min(...matches.map(j => j.salaryMin))
          const max = Math.max(...matches.map(j => j.salaryMax))
          return [
            { from: 'bot', kind: 'text', text: `Staff Nurse roles in Qatar pay around ₹${min.toLocaleString()}–₹${max.toLocaleString()} / month. Here are open postings:` },
            { from: 'bot', kind: 'jobCards', items: matches.slice(0, 3) },
          ]
        }
        return [{ from: 'bot', kind: 'text', text: 'No Staff Nurse posting in Qatar at the moment, but here are similar roles across the Gulf:' },
                { from: 'bot', kind: 'jobCards', items: JOBS.filter(j => j.title === 'Staff Nurse').slice(0, 3) }]
      },
    },
    {
      keys: ['employer safe', 'is employer', 'employer trust', 'employer rating'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Each employer has a Trust Score from verified worker reviews + compliance flags. Tap any employer name to see their full profile.' },
        { from: 'bot', kind: 'action', label: 'See top-rated employers', icon: Building2, target: 'jobs' },
      ],
    },
    {
      keys: ['verified jobs only', 'only verified', 'safe jobs'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Use the "Verified employers only" filter on the Jobs page to hide unverified postings.' },
        { from: 'bot', kind: 'action', label: 'Open Jobs', icon: Briefcase, target: 'jobs' },
      ],
    },
    {
      keys: ['document for saudi', 'documents for saudi', 'saudi arabia documents', 'saudi checklist'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'For Saudi Arabia: Passport (6mo+), Work Visa, GAMCA medical, PCC, Yellow Fever certificate, attested 10th/12th and ITI marksheets.' },
        { from: 'bot', kind: 'action', label: 'Open Pre-Departure', icon: ShieldCheck, target: 'predeparture' },
      ],
    },
    {
      keys: ['migration cost', 'how much will it cost', 'cost of migration', 'how much cost'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'A typical Gulf migration costs ₹1,00,000 – ₹1,50,000 (visa + agent + travel + 3 months living). Use the calculator for your exact numbers.' },
        { from: 'bot', kind: 'action', label: 'Open Cost Calculator', icon: Calculator, target: 'calculator' },
      ],
    },
    {
      keys: ['need a loan', 'migration loan', 'i need a loan', 'pravasi loan', 'loan for visa', 'loan for travel', 'loan for housing', 'loan for skilling', 'apply for loan'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'I can help you compare migration loans by interest, EMI and relaxation period. Pick the loan need and I\'ll show banks that fit.' },
        { from: 'bot', kind: 'action', label: 'Open Loans', icon: Wallet, target: 'loans' },
      ],
    },
    {
      keys: ['emi', 'how much emi', 'show emi', 'monthly emi'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'EMI depends on amount, tenure and lender rate. SBI 10.5% p.a. for 24 months on ₹1,00,000 ≈ ₹4,628/mo. Open Loans → Compare to see live numbers.' },
        { from: 'bot', kind: 'action', label: 'Compare loans', icon: Wallet, target: 'loans' },
      ],
    },
    {
      keys: ['loan status', 'check loan', 'my loan', 'my loans'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open My Loans to see active applications, EMI schedule and lender contact.' },
        { from: 'bot', kind: 'action', label: 'My Loans', icon: Wallet, target: 'loans', params: { mode: 'list' } },
      ],
    },
    {
      keys: ['loan documents', 'documents for loan', 'loan paper'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Lenders typically need Aadhaar, passport and a job contract. Visa, tickets and PCC speed up approval.' },
        { from: 'bot', kind: 'action', label: 'Build a loan need', icon: Wallet, target: 'loans' },
      ],
    },
    {
      keys: ['buy insurance', 'get insurance', 'insurance', 'pbby', 'family health insurance', 'travel insurance'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Browse insurance by category — PBBY (mandatory for ECR), Travel, Health, Life, Family Health and Child Savings. Compare premium, coverage and claim support.' },
        { from: 'bot', kind: 'action', label: 'Open Insurance', icon: ShieldCheck, target: 'insurance' },
      ],
    },
    {
      keys: ['insurance claim', 'file insurance', 'file claim'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open My Insurance to start a claim against an active policy. Helpline numbers are listed on the policy detail page.' },
        { from: 'bot', kind: 'action', label: 'My Insurance', icon: ShieldCheck, target: 'insurance', params: { mode: 'list' } },
      ],
    },
    {
      keys: ['my insurance', 'show my insurance', 'my polic'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Here are your insurance policies — tap any to view details, file a claim, or download the policy PDF.' },
        { from: 'bot', kind: 'action', label: 'My Insurance', icon: ShieldCheck, target: 'insurance', params: { mode: 'list' } },
      ],
    },
    {
      keys: ['book ticket', 'book my ticket', 'find flight', 'flights to dubai', 'travel options', 'pay for ticket'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Pick origin / destination airport, dates and passenger details — then pay by UPI, EMI or bank transfer.' },
        { from: 'bot', kind: 'action', label: 'Book travel', icon: Plane, target: 'travel' },
      ],
    },
    {
      keys: ['my ticket', 'show ticket', 'when is my flight', 'travel reminder'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open My Travel for ticket details, reminders and the timeline.' },
        { from: 'bot', kind: 'action', label: 'My Travel', icon: Plane, target: 'travel', params: { mode: 'list' } },
      ],
    },
    {
      keys: ['swift apply', 'apply with my profile', 'pravasi profile'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Swift Apply uses your verified Pravasi profile, Skill Passport and certificates — recruiters get a complete file in one tap. Open a job and tap Apply Now to choose Swift Apply or Manual.' },
        { from: 'bot', kind: 'action', label: 'Browse jobs', icon: Briefcase, target: 'jobs' },
      ],
    },
    {
      keys: ['manual application', 'apply manually'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Manual applications take a bit longer to review. Tap Apply Now on any job and pick "Manual entry".' },
        { from: 'bot', kind: 'action', label: 'Browse jobs', icon: Briefcase, target: 'jobs' },
      ],
    },
    {
      keys: ['emigrate', 'verified jobs', 'safe migration route'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Pravasi Setu lists eMigrate-compatible employers with verification badges. Flagged employers are removed from search.' },
        { from: 'bot', kind: 'action', label: 'Verified jobs', icon: Briefcase, target: 'jobs' },
      ],
    },
    {
      keys: ['loan', 'pravasi loan', 'pravasi-loan'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open Loans to compare lenders by EMI and relaxation period.' },
        { from: 'bot', kind: 'action', label: 'Open Loans', icon: Wallet, target: 'loans' },
      ],
    },
    {
      keys: ['visa appointment', 'visa booking', 'visa slot', 'vfs', 'bls'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'You can book a visa appointment via VFS (₹5,500 · 7–10 days) or BLS (₹4,800 · 10–14 days).' },
        { from: 'bot', kind: 'action', label: 'Pre-Departure (visa)', icon: Plane, target: 'predeparture' },
      ],
    },
    {
      keys: ['housing', 'house', 'accommodation', 'rent in dubai'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Affordable shared accommodation near Al Quoz / Sonapur starts at AED 600/mo. Tap Housing inside Post-Arrival.' },
        { from: 'bot', kind: 'action', label: 'Open Post-Arrival', icon: HomeIcon, target: 'postarrival' },
      ],
    },
    {
      keys: ['sim card', 'mobile sim', 'phone sim'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Etisalat & du sell pre-paid SIMs at the airport. Carry your passport + Emirates ID receipt.' },
        { from: 'bot', kind: 'action', label: 'Open Post-Arrival', icon: HomeIcon, target: 'postarrival' },
      ],
    },
    {
      keys: ['arabic', 'learn arabic', 'language', 'how to say'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'I can teach you 10 essential Arabic phrases a day — mostly safety + workplace words. Tap below to start.' },
        { from: 'bot', kind: 'action', label: 'Language basics', icon: Languages, target: 'predeparture' },
      ],
    },
    {
      keys: ['indian community', 'desi group', 'whatsapp group'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'A 850+ member WhatsApp community is active in Dubai. Find them and other support contacts in Post-Arrival.' },
        { from: 'bot', kind: 'action', label: 'Post-Arrival', icon: MessageCircle, target: 'postarrival' },
      ],
    },
    {
      keys: ['send money', 'remit money', 'send to family', 'transfer money', 'money home', 'send ₹', 'send rs', 'send to my mother', 'send to my father', 'send to wife'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'You can send to UPI, bank account, or cash pickup. Wise has the best rate today (₹22.92/AED, fee ₹90).' },
        { from: 'bot', kind: 'action', label: 'Start a transfer', icon: SendIcon, target: 'remittance' },
      ],
    },
    {
      keys: ['send to upi', 'upi transfer', 'upi id'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'UPI transfers usually deliver in minutes — you only need the recipient\'s UPI ID. We confirm the recipient name before sending.' },
        { from: 'bot', kind: 'action', label: 'Send to UPI', icon: SendIcon, target: 'remittance' },
      ],
    },
    {
      keys: ['send to bank', 'bank account', 'ifsc'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Bank-account transfers reach most Indian banks the same day. We\'ll need the account number and IFSC code.' },
        { from: 'bot', kind: 'action', label: 'Send to bank account', icon: SendIcon, target: 'remittance' },
      ],
    },
    {
      keys: ['cash pickup', 'cash near my family', 'cash near'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Cash pickup at Western Union / MoneyGram / India Post locations near your family. Receiver must carry a valid ID and the pickup code we send by SMS.' },
        { from: 'bot', kind: 'action', label: 'Send for cash pickup', icon: SendIcon, target: 'remittance' },
      ],
    },
    {
      keys: ['cheapest way', 'best rate', 'lowest fee', 'compare provider'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Wise and NPCI UPI inward-remittance currently give the best ₹/AED with zero or near-zero fees. SBI is slower but trusted. Compare all 8 providers inside Remittance.' },
        { from: 'bot', kind: 'action', label: 'Compare providers', icon: SendIcon, target: 'remittance' },
      ],
    },
    {
      keys: ['track transfer', 'track my transfer', 'transfer status', 'where is my transfer'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Your latest transfer TR-9821 is in UPI processing. ETA: 11:00 AM today.' },
        { from: 'bot', kind: 'action', label: 'Open Transfer Tracker', icon: Receipt, target: 'transferTracker', params: { transferId: 'TR-9821' } },
      ],
    },
    {
      keys: ['transfer delayed', 'why is my transfer', 'delayed', 'stuck'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Compliance reviews can add 30–60 minutes. If it\'s been longer, I\'ll route to support. Want to check the timeline?' },
        { from: 'bot', kind: 'action', label: 'Check tracker', icon: Receipt, target: 'transferTracker' },
      ],
    },
    {
      keys: ['download receipt', 'transfer receipt'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Open the transfer in the tracker — you can download the PDF or share it on WhatsApp.' },
        { from: 'bot', kind: 'action', label: 'Open Transfer Tracker', icon: Download, target: 'transferTracker' },
      ],
    },
    {
      keys: ['notify receiver', 'tell my family', 'sms recipient'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'I\'ll send your recipient an SMS with the transfer ID and ETA. Tap below to choose which transfer.' },
        { from: 'bot', kind: 'action', label: 'Pick a transfer', icon: Receipt, target: 'transferTracker' },
      ],
    },
    {
      keys: ['rate alert', 'notify me when', 'set alert'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Set a threshold (e.g. 1 AED ≥ ₹23.10). I\'ll notify you the moment the rate beats it — useful for monthly remittances.' },
        { from: 'bot', kind: 'action', label: 'Open Remittance', icon: SendIcon, target: 'remittance' },
      ],
    },
    {
      keys: ['check salary', 'my salary', 'payslip'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Your April net pay was ₹51,200, paid 1 May. Tap below to see all payslips and deductions.' },
        { from: 'bot', kind: 'action', label: 'Open Employment', icon: Wallet, target: 'employment' },
      ],
    },
    {
      keys: ['download contract', 'view contract', 'show contract'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Your Al Habtoor contract is available, translated to Hindi. Tap Employment to view or download.' },
        { from: 'bot', kind: 'action', label: 'Open Employment', icon: Wallet, target: 'employment' },
      ],
    },
    {
      keys: ['work history', 'employment history', 'past jobs'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Your verified work history lives inside the Skill Passport. It updates automatically when you finish a job.' },
        { from: 'bot', kind: 'action', label: 'Open Skill Passport', icon: Award, target: 'passport' },
      ],
    },
    {
      keys: ['return to india', 'going back', 'come home', 'reintegrate'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'I\'ll help you close abroad chapters and re-enter the Indian job market. We\'ll map your Gulf certifications to NSDC equivalents.' },
        { from: 'bot', kind: 'action', label: 'Return & Reintegration', icon: RotateCcw, target: 'return' },
      ],
    },
    {
      keys: ['book ticket', 'flight ticket', 'book flight'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Air India ₹18,400 (direct), flydubai ₹16,950, Emirates ₹22,300 — all listed in Pre-Departure → Tickets.' },
        { from: 'bot', kind: 'action', label: 'Pre-Departure', icon: Plane, target: 'predeparture' },
      ],
    },
    {
      keys: ['jobs in india', 'india job', 'find job in india'],
      reply: () => [
        { from: 'bot', kind: 'text', text: '12 matches in Lucknow with skills mapped from your Gulf experience. View under Return → Find jobs in India.' },
        { from: 'bot', kind: 'action', label: 'Open Return', icon: RotateCcw, target: 'return' },
      ],
    },
    {
      keys: ['employer not paying', 'salary not paid', 'pending salary', 'salary delay'],
      reply: () => [
        { from: 'bot', kind: 'text', text: '⚠️ Salary disputes go to MEA + Embassy + Pravasi Setu legal team. Let\'s file it — your previous ticket #PS-2031 is also open.' },
        { from: 'bot', kind: 'action', label: 'Raise Grievance', icon: AlertTriangle, target: 'grievance', danger: true },
      ],
    },
    {
      keys: ['urgent help', 'emergency', 'sos', 'in trouble', 'rescue'],
      reply: () => [
        { from: 'bot', kind: 'text', text: '🚨 Tap below to open Emergency Assistance — instant SOS, embassy hotlines and live location sharing.' },
        { from: 'bot', kind: 'action', label: 'Emergency Assistance', icon: AlertTriangle, target: 'emergency', danger: true },
      ],
    },
    {
      keys: ['file complaint', 'complain', 'grievance', 'report employer'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'Tell me what happened. Each complaint is auto-routed to MEA + Embassy + Pravasi legal.' },
        { from: 'bot', kind: 'action', label: 'Raise Grievance', icon: AlertTriangle, target: 'grievance' },
      ],
    },
    {
      keys: ['talk to support', 'support', 'human agent', 'speak to someone'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'A human officer can call you back. Choose the topic — emergency, legal, or money?' },
        { from: 'bot', kind: 'action', label: 'Talk to support', icon: Phone, target: 'emergency' },
      ],
    },
    {
      keys: ['medical', 'health', 'doctor', 'hospital'],
      reply: () => [
        { from: 'bot', kind: 'text', text: 'For pre-departure medicals, GAMCA-approved centres charge ~₹4,500. Post-arrival, your insurance covers cashless hospital visits.' },
        { from: 'bot', kind: 'action', label: 'Pre-Departure', icon: Stethoscope, target: 'predeparture' },
      ],
    },
  ]
}

export default function ChatPage() {
  const { navigate } = useApp()
  const [msgs, setMsgs] = useState(INITIAL)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)
  const intentsRef = useRef(buildIntents(JOBS))

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing])

  const respond = (userText) => {
    setMsgs(m => [...m, { from: 'user', kind: 'text', text: userText }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const lc = userText.toLowerCase()
      const intent = intentsRef.current.find(i => i.keys.some(k => lc.includes(k)))
      const reply = intent ? intent.reply() : [
        { from: 'bot', kind: 'text', text: 'I can help with profile setup, jobs, employer trust, certificates, costs, loans, visas, housing, language, money transfers, salary, complaints, return-to-India and emergencies. Try one of these:' },
        { from: 'bot', kind: 'suggestions' },
      ]
      setMsgs(m => [...m, ...reply])
    }, 700)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const text = input
    setInput('')
    respond(text)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-chat overflow-hidden">
      <StatusBar dark />
      <div className="bg-primary text-white px-4 pt-2 pb-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold flex items-center gap-1.5">
            Setu Assistant
            <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
          </div>
          <div className="text-[10px] text-white/75">Multilingual · Voice + Text · Always free</div>
        </div>
        <button onClick={() => navigate('emergency')} className="w-9 h-9 rounded-full bg-danger/30 flex items-center justify-center" aria-label="Emergency">
          <Phone size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {msgs.map((m, i) => <Message key={i} m={m} onSuggest={respond} navigate={navigate} />)}
          {typing && (
            <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-2xl rounded-bl-sm w-fit shadow-card">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-txt-tertiary animate-typing" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-bdr-light bg-white flex items-center gap-2 flex-shrink-0">
        <button onClick={() => respond('Voice input demo')} className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
          <Mic size={18} className="text-primary" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything..."
          className="flex-1 px-4 py-2.5 bg-surface-secondary rounded-pill text-[13px] outline-none"
        />
        <button onClick={handleSend} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-card">
          <Send size={16} className="text-white" />
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

function Message({ m, onSuggest, navigate }) {
  if (m.from === 'user') {
    return (
      <div className="flex justify-end animate-bubble-in">
        <div className="max-w-[80%] bg-primary text-white px-3.5 py-2.5 rounded-2xl rounded-br-sm">
          <p className="text-[13px] leading-relaxed">{m.text}</p>
        </div>
      </div>
    )
  }

  if (m.kind === 'text') {
    return (
      <div className="flex animate-bubble-in">
        <div className="max-w-[85%] bg-white px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-card">
          <p className="text-[13px] text-txt-primary leading-relaxed">{m.text}</p>
        </div>
      </div>
    )
  }

  if (m.kind === 'suggestions') {
    return (
      <div className="flex flex-wrap gap-2 mt-1 animate-bubble-in">
        {SUGGESTED_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => onSuggest(p)}
            className="text-[11px] font-semibold bg-white text-primary border border-primary/30 px-3 py-1.5 rounded-pill active:bg-primary-light"
          >
            {p}
          </button>
        ))}
      </div>
    )
  }

  if (m.kind === 'jobCards') {
    return (
      <div className="space-y-2 animate-bubble-in">
        {m.items.map(j => (
          <button
            key={j.id}
            onClick={() => navigate('jobDetail', { jobId: j.id })}
            className="w-full bg-white rounded-2xl p-3 shadow-card text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
                <Briefcase size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-txt-primary truncate">{j.title}</div>
                <div className="text-[10px] text-txt-secondary truncate">{j.employerName} · {j.destinationCity}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-bdr-light">
              <span className="text-[11px] text-primary font-bold">₹{j.salaryMin.toLocaleString()}+</span>
              <span className="text-[10px] text-warn font-bold">⭐ {j.trustScore}</span>
            </div>
          </button>
        ))}
      </div>
    )
  }

  if (m.kind === 'action') {
    const Icon = m.icon
    return (
      <button
        onClick={() => navigate(m.target, m.params || {})}
        className={`w-fit flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-card animate-bubble-in ${
          m.danger ? 'bg-danger text-white' : 'bg-white text-primary border border-primary/30'
        }`}
      >
        <Icon size={16} />
        <span className="text-[12px] font-bold">{m.label}</span>
        <ChevronRight size={14} />
      </button>
    )
  }

  return null
}
