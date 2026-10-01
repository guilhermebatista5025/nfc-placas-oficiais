import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="grid min-h-dvh place-items-center bg-slate-50 text-xs font-semibold text-slate-500">Validando sessão...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/app" replace />} />

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
        <Route path="finance" element={<Finance />} />
        <Route path="credentials" element={<Credentials />} />
        <Route path="reports" element={<Reports />} />
        <Route path="team" element={<Team />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
