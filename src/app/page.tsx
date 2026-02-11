'use client'

import { useRef, useState, useEffect } from 'react'
import KeyboardScroll from '@/components/KeyboardScroll'
import AgendaGallery from '@/components/AgendaGallery'
import HeroOverlay from '@/components/HeroOverlay'
import AgendaTransitionOverlay from '@/components/AgendaTransitionOverlay'
import CheckInForm from '@/components/CheckInForm'
import MiniGame from '@/components/MiniGame'

export default function Home() {
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const [attendanceId, setAttendanceId] = useState<string | null>(null)
  const [isMiniGameVisible, setIsMiniGameVisible] = useState(false)
  const miniGameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check for existing registration
    const storedId = localStorage.getItem('attendanceId')
    if (storedId) {
      setAttendanceId(storedId)
    }
  }, [])

  useEffect(() => {
    if (!attendanceId || !miniGameRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMiniGameVisible(entry.isIntersecting)
      },
      { threshold: 0.2 } // Trigger when 20% of MiniGame is visible
    )

     observer.observe(miniGameRef.current)

    return () => observer.disconnect()
  }, [attendanceId])

  const handleCheckInSuccess = (id: string) => {
    setAttendanceId(id)
    localStorage.setItem('attendanceId', id)
    // Small delay to ensure render before scrolling
    setTimeout(() => {
      miniGameRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <main className="bg-black">
      <HeroOverlay isVisible={isContentLoaded} isMiniGameVisible={isMiniGameVisible} />
      <AgendaTransitionOverlay />
      <KeyboardScroll onLoadComplete={() => setIsContentLoaded(true)} />
      
      {/* Agenda Gallery Section */}
      <AgendaGallery />
      
      {/* Check-In Form Section */}
      <CheckInForm onSuccess={handleCheckInSuccess} />
      
      {/* Mini Game Section - Only visible after check-in */}
      {attendanceId && (
        <div ref={miniGameRef} className="min-h-screen relative">
          <MiniGame attendanceId={attendanceId} />
        </div>
      )}
      
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
