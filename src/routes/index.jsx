import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { Clients } from '@/pages/clients/Clients'
import { ClientDetail } from '@/pages/clients/ClientDetail'
import { Plates } from '@/pages/plates/Plates'
import { Sales } from '@/pages/sales/Sales'
import { NewSale } from '@/pages/sales/NewSale'
import { Products } from '@/pages/products/Products'
import { Inventory } from '@/pages/inventory/Inventory'
import { Credentials } from '@/pages/credentials/Credentials'
import { Reports } from '@/pages/reports/Reports'
import { Team } from '@/pages/team/Team'
import { Billing } from '@/pages/billing/Billing'
import { Settings } from '@/pages/settings/Settings'
import { Finance } from '@/pages/finance/Finance'
import { useAuth } from '@/contexts/AuthContext'
import { PlanGate } from '@/components/billing/PlanGate'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return <RouteLoading />
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <RouteLoading />
  if (user) return <Navigate to="/app" replace />
  return children
}

function EntryRoute() {
  const { user, loading } = useAuth()
  if (loading) return <RouteLoading />
  return <Navigate to={user ? '/app' : '/login'} replace />
}

function RouteLoading() {
  return <div className="grid min-h-dvh place-items-center bg-slate-50 text-xs font-semibold text-slate-500">Validando sessão...</div>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Root redirect */}
      <Route path="/" element={<EntryRoute />} />

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="plates" element={<Plates />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/new" element={<NewSale />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="finance" element={<PlanGate feature="finance" title="Financeiro completo" requiredPlan="Starter"><Finance /></PlanGate>} />
        <Route path="credentials" element={<PlanGate feature="credentials" title="Cofre de credenciais" requiredPlan="Pro"><Credentials /></PlanGate>} />
        <Route path="reports" element={<PlanGate feature="reports" title="Relatórios avançados" requiredPlan="Pro"><Reports /></PlanGate>} />
        <Route path="team" element={<PlanGate feature="team" title="Equipe e permissões" requiredPlan="Pro"><Team /></PlanGate>} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<EntryRoute />} />
    </Routes>
  )
}
