import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function DashboardLayout() {
  const location = useLocation()
  const isBilling = location.pathname === '/app/billing'

  return (
    <div className="mobile-app-shell">
      <main className={isBilling ? '' : 'mobile-app-content'}>
        <Outlet />
      </main>
      {!isBilling && <BottomNav />}
    </div>
  )
}

