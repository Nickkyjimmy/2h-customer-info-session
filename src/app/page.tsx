'use client'

import { useState } from 'react'
import KeyboardScroll from '@/components/KeyboardScroll'
import AgendaGallery from '@/components/AgendaGallery'
import HeroOverlay from '@/components/HeroOverlay'
import AgendaTransitionOverlay from '@/components/AgendaTransitionOverlay'
import CheckInForm from '@/components/CheckInForm'

export default function Home() {
  const [isContentLoaded, setIsContentLoaded] = useState(false)

  return (
    <main className="bg-black">
      <HeroOverlay isVisible={isContentLoaded} />
      <AgendaTransitionOverlay />
      <KeyboardScroll onLoadComplete={() => setIsContentLoaded(true)} />
      
      {/* Agenda Gallery Section */}
      <AgendaGallery />
      
      {/* Check-In Form Section */}
      <CheckInForm />
      
      {/* Additional content below */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">2h Customer Info Session</h1>
          <p className="text-xl text-gray-400">Scroll up to see the keyboard animation</p>
        </div>
      </div>
    </main>
  )
}
