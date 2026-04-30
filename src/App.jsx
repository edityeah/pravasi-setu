import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Toast from './components/Toast'

import AgenticShell               from './agentic/AgenticShell'
import SplashPage                  from './pages/SplashPage'
import LoginPage                   from './pages/LoginPage'
import OTPPage                     from './pages/OTPPage'
import KYCPage                     from './pages/KYCPage'
import HomePage                    from './pages/HomePage'
import ProfilePage                 from './pages/ProfilePage'
import ProfileSetupPage            from './pages/ProfileSetupPage'
import SkillPassportPage           from './pages/SkillPassportPage'
import CertificateVerificationPage from './pages/CertificateVerificationPage'
import JobsPage                    from './pages/JobsPage'
import JobDetailPage               from './pages/JobDetailPage'
import EmployerProfilePage         from './pages/EmployerProfilePage'
import ApplicationTrackerPage      from './pages/ApplicationTrackerPage'
import RateEmployerPage            from './pages/RateEmployerPage'
import CalculatorPage              from './pages/CalculatorPage'
import PreDeparturePage            from './pages/PreDeparturePage'
import PostArrivalPage             from './pages/PostArrivalPage'
import RemittancePage              from './pages/RemittancePage'
import TransferTrackerPage         from './pages/TransferTrackerPage'
import EmploymentPage              from './pages/EmploymentPage'
import ReturnPage                  from './pages/ReturnPage'
import GrievancePage               from './pages/GrievancePage'
import TicketDetailPage            from './pages/TicketDetailPage'
import EmergencyAssistancePage     from './pages/EmergencyAssistancePage'
import ChatPage                    from './pages/ChatPage'
import UpdatesPage                 from './pages/UpdatesPage'
import LoansPage                   from './pages/LoansPage'
import InsurancePage               from './pages/InsurancePage'
import TravelPage                  from './pages/TravelPage'
import JobApplyChoicePage          from './pages/JobApplyChoicePage'
import ResumeBuilderPage           from './pages/ResumeBuilderPage'

const ROUTES = {
  splash:                  SplashPage,
  login:                   LoginPage,
  otp:                     OTPPage,
  kyc:                     KYCPage,
  home:                    AgenticShell,
  classicHome:             HomePage,
  profile:                 ProfilePage,
  profileSetup:            ProfileSetupPage,
  passport:                SkillPassportPage,
  certificate:             CertificateVerificationPage,
  jobs:                    JobsPage,
  jobDetail:               JobDetailPage,
  employerProfile:         EmployerProfilePage,
  applicationTracker:      ApplicationTrackerPage,
  rateEmployer:            RateEmployerPage,
  calculator:              CalculatorPage,
  predeparture:            PreDeparturePage,
  postarrival:             PostArrivalPage,
  remittance:              RemittancePage,
  transferTracker:         TransferTrackerPage,
  employment:              EmploymentPage,
  return:                  ReturnPage,
  grievance:               GrievancePage,
  ticketDetail:            TicketDetailPage,
  emergency:               EmergencyAssistancePage,
  chat:                    ChatPage,
  updates:                 UpdatesPage,
  loans:                   LoansPage,
  insurance:               InsurancePage,
  travel:                  TravelPage,
  jobApplyChoice:          JobApplyChoicePage,
  resumeBuilder:           ResumeBuilderPage,
}

function AppRoutes() {
  const { screen } = useApp()
  const Page = ROUTES[screen] || SplashPage

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-surface-secondary flex flex-col">
      <Page key={screen} />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
