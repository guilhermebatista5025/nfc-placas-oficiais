import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import { AppRoutes } from '@/routes'
import { MonitorOff, Smartphone } from 'lucide-react'

export function App() {
  return (
    <>
      <div className="desktop-disabled">
        <div className="desktop-disabled__icon"><MonitorOff size={34} /></div>
        <h1>Versão mobile em construção</h1>
        <p>Por enquanto, o Craft NFC Manager está disponível somente em celulares.</p>
        <div className="desktop-disabled__hint"><Smartphone size={18} /> Abra em uma tela com até 767 px</div>
      </div>
      <div className="mobile-only-root">
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
