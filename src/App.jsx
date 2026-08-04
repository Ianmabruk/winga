import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import ProtectedRoute from './routes/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const MarketPage = lazy(() => import('./pages/MarketPage'))
const LiveRatesPage = lazy(() => import('./pages/LiveRatesPage'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const AdminLayoutPage = lazy(() => import('./pages/admin/AdminLayoutPage'))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'))
const UsersPage = lazy(() => import('./pages/admin/UsersPage'))
const KycPage = lazy(() => import('./pages/admin/KycPage'))
const BranchesPage = lazy(() => import('./pages/admin/BranchesPage'))
const RatesPage = lazy(() => import('./pages/admin/RatesPage'))
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'))

import WingaForexLogo from './components/WingaForexLogo'

const RouteLoader = () => (
  <div className="glass-surface grid place-items-center rounded-3xl p-10 text-center">
    <WingaForexLogo variant="header" />
    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-skybrand-700">Loading view</p>
    <p className="mt-2 text-sm font-semibold text-slate-700">Preparing dashboard experience...</p>
  </div>
)

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/market" element={<Navigate to="/rates-dashboard" replace />} />
          <Route path="/rates-dashboard" element={<MarketPage />} />
          <Route path="/rates" element={<LiveRatesPage />} />
          <Route path="/live-rates" element={<Navigate to="/rates" replace />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminLayoutPage />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="kyc" element={<KycPage />} />
              <Route path="branches" element={<BranchesPage />} />
              <Route path="rates" element={<RatesPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
