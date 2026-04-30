import React from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { VerifiedBadge } from '../components/VerifiedBadge'
import {
  User, Phone, MapPin, BookOpen, ChevronRight, BookUser, Fingerprint,
  FileText, LogOut, Settings, Globe, Languages, ShieldCheck,
  Wallet, Shield, Plane, Users, Send, Briefcase,
} from 'lucide-react'

export default function ProfilePage() {
  const {
    profile, navigate, signOut,
    loanApplications, insurancePolicies, travelBookings,
    beneficiaries, transfers, applications, resume,
  } = useApp()
  const resumeUpdated = resume?.lastUpdated
    ? new Date(resume.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="My Profile" />
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-screen-md mx-auto w-full px-4 sm:px-5 py-4 space-y-4">
          {/* Header summary */}
          <div className="bg-white rounded-3xl shadow-card p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-[22px] font-bold flex-shrink-0 shadow-modal">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-bold text-txt-primary truncate">{profile.name}</div>
              <div className="text-[12px] text-txt-secondary truncate">{profile.phone}</div>
              <div className="flex items-center gap-1 mt-1.5">
                <VerifiedBadge verified label="KYC Verified" />
              </div>
            </div>
          </div>

          {/* Identity */}
          <Section title="Identity">
            <Row icon={Fingerprint} label="Aadhaar" value="XXXX XXXX 4523" verified={profile.aadhaarVerified} />
            <Row icon={BookUser}    label="APAAR ID" value="APR-2389-4521" verified={profile.apaarVerified} />
            <Row icon={FileText}    label="DigiLocker" value="Linked · 8 documents" verified={profile.digilockerLinked} />
            <Row icon={ShieldCheck} label="Police Clearance Certificate" value="Not yet uploaded" verified={profile.pccVerified} />
          </Section>

          {/* Personal */}
          <Section title="Personal Details">
            <Row icon={User}     label="Age & Gender" value={`${profile.age} · ${profile.gender}`} />
            <Row icon={MapPin}   label="Location"     value={profile.location} />
            <Row icon={BookOpen} label="Education"    value={profile.education} />
            <Row icon={Phone}    label="Phone"        value={profile.phone} />
          </Section>

          {/* Documents & Skills */}
          <Section title="Documents & Skills">
            <LinkRow icon={ShieldCheck} label="Skill Passport" sub={`${profile.skills.length} skills · ${profile.certifications.length} certificates`} onClick={() => navigate('passport')} />
            <LinkRow
              icon={FileText}
              label="Resume Builder"
              sub={resumeUpdated ? `Last updated ${resumeUpdated} · Download PDF` : 'Edit, preview & download PDF'}
              onClick={() => navigate('resumeBuilder')}
            />
            <LinkRow icon={Languages}   label="Languages"      sub="Hindi, English, Basic Arabic" />
          </Section>

          {/* My Services */}
          <Section title="My Services">
            <LinkRow
              icon={Wallet}    label="My Loans"
              sub={loanApplications.length ? `${loanApplications.length} application${loanApplications.length === 1 ? '' : 's'}` : 'No applications yet'}
              onClick={() => navigate('loans', { mode: 'list' })}
            />
            <LinkRow
              icon={Shield}    label="My Insurance"
              sub={insurancePolicies.length ? `${insurancePolicies.length} polic${insurancePolicies.length === 1 ? 'y' : 'ies'}` : 'No policies yet'}
              onClick={() => navigate('insurance', { mode: 'list' })}
            />
            <LinkRow
              icon={Plane}     label="My Travel Tickets"
              sub={travelBookings.length ? `${travelBookings.length} booking${travelBookings.length === 1 ? '' : 's'}` : 'No tickets yet'}
              onClick={() => navigate('travel', { mode: 'list' })}
            />
            <LinkRow
              icon={Send}      label="My Transfers"
              sub={`${transfers.length} transfer${transfers.length === 1 ? '' : 's'}`}
              onClick={() => navigate('transferTracker')}
            />
            <LinkRow
              icon={Users}     label="My Beneficiaries"
              sub={beneficiaries.length ? `${beneficiaries.length} saved` : 'Add a recipient from Send Money'}
              onClick={() => navigate('remittance')}
            />
            <LinkRow
              icon={Briefcase} label="My Applications"
              sub={`${applications.length} job application${applications.length === 1 ? '' : 's'}`}
              onClick={() => navigate('applicationTracker')}
            />
          </Section>

          {/* Settings */}
          <Section title="Settings">
            <LinkRow icon={Globe}    label="Language"             sub="English · Voice support enabled" />
            <LinkRow icon={Settings} label="Notifications & Alerts" />
            <LinkRow icon={LogOut}   label="Sign Out" danger onClick={() => signOut()} />
          </Section>

          <p className="text-center text-[10px] text-txt-tertiary pt-2 pb-3 px-2 leading-relaxed">
            Pravasi Setu v0.1 · Powered by ConveGenius · In partnership with NSDC International
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-card p-5">
      <div className="text-[11px] font-bold text-txt-secondary uppercase tracking-wide mb-3">{title}</div>
      <div className="divide-y divide-bdr-light/60">
        {children}
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, value, verified }) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-txt-secondary">{label}</div>
        <div className="text-[13px] font-semibold text-txt-primary truncate">{value}</div>
      </div>
      {verified !== undefined && <VerifiedBadge verified={verified} />}
    </div>
  )
}

function LinkRow({ icon: Icon, label, sub, danger, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 first:pt-0 last:pb-0 active:bg-surface-secondary rounded-lg text-left transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        danger ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary'
      }`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-semibold ${danger ? 'text-danger' : 'text-txt-primary'}`}>{label}</div>
        {sub && <div className="text-[11px] text-txt-secondary truncate">{sub}</div>}
      </div>
      <ChevronRight size={16} className="text-txt-tertiary flex-shrink-0" />
    </button>
  )
}
