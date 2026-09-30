import React from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function DashboardLayout() {
  return (
    <div className="mobile-app-shell">
      <main className="mobile-app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

