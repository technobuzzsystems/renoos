import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SingleScreenExplorer } from '@/pages/SingleScreenExplorer'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AuthModal, UserBookingsModal } from '@/components/auth'

const LuxuryPageLoader = () => (
  <div className="h-screen w-screen bg-[#142018] flex flex-col items-center justify-center space-y-4">
    <div className="w-10 h-10 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
    <span className="font-serif text-lg tracking-wider text-cream uppercase font-normal">
      RENOOS HOTEL
    </span>
    <span className="text-[10px] tracking-widest uppercase text-cream/60 font-mono">
      Loading 360° Renoos Hotel Experience...
    </span>
  </div>
)

const GlobalAuthModals: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, isBookingsModalOpen, setIsBookingsModalOpen } =
    useAuth()

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <UserBookingsModal
        isOpen={isBookingsModalOpen}
        onClose={() => setIsBookingsModalOpen(false)}
      />
    </>
  )
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalAuthModals />
        <Suspense fallback={<LuxuryPageLoader />}>
          <Routes>
            <Route path="/" element={<SingleScreenExplorer />} />
            <Route path="/rooms" element={<SingleScreenExplorer />} />
            <Route path="/rooms/:roomId" element={<SingleScreenExplorer />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<SingleScreenExplorer />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
