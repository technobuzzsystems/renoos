import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SingleScreenExplorer } from '@/pages/SingleScreenExplorer'

const LuxuryPageLoader = () => (
  <div className="h-screen w-screen bg-[#142018] flex flex-col items-center justify-center space-y-4">
    <div className="w-10 h-10 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
    <span className="font-serif text-lg tracking-wider text-cream uppercase font-normal">
      SB FARM
    </span>
    <span className="text-[10px] tracking-widest uppercase text-cream/60 font-mono">
      Loading 360° Sanctuary Experience...
    </span>
  </div>
)

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LuxuryPageLoader />}>
        <Routes>
          <Route path="/" element={<SingleScreenExplorer />} />
          <Route path="/rooms" element={<SingleScreenExplorer />} />
          <Route path="/rooms/:roomId" element={<SingleScreenExplorer />} />
          <Route path="*" element={<SingleScreenExplorer />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
