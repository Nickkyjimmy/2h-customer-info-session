'use client'

import { useRef, useState, useEffect } from 'react'
import KeyboardScroll from '@/components/KeyboardScroll'
import AgendaGallery from '@/components/AgendaGallery'
import HeroOverlay from '@/components/HeroOverlay'
import AgendaTransitionOverlay from '@/components/AgendaTransitionOverlay'
import CheckInForm from '@/components/CheckInForm'
import MiniGame from '@/components/MiniGame'
import OutroScroll from '@/components/OutroScroll'
import { motion, AnimatePresence } from 'framer-motion'
import MiniGameV2 from '@/components/MiniGameV2'

export default function Home() {
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
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

    if (!miniGameRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMiniGameVisible(entry.isIntersecting)
      },
      { threshold: 0.2 } // Trigger when 20% of MiniGame is visible
    )

     observer.observe(miniGameRef.current)

    return () => observer.disconnect()
  }, [])

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
      {/* Global Loader */}
      <AnimatePresence>
        {!isContentLoaded && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
             {/* Loader Card matching HeroOverlay dimensions */}
             <div className="relative w-[340px] md:w-[420px] h-[560px] flex flex-col items-center justify-center p-6">
                
                {/* Static Faint Border */}
                <div className="absolute inset-0 border border-white/10" />
                
                {/* Animated Progress Border */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.rect
                    width="100%"
                    height="100%"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: loadingProgress / 100 }}
                    transition={{ ease: "linear", duration: 0.1 }}
                    className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </svg>
                
                {/* Percentage Text */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-white font-mono text-4xl font-bold tracking-tighter">
                        {loadingProgress}%
                    </span>
                    <span className="text-white/50 text-xs uppercase tracking-widest animate-pulse">
                        Loading Experience
                    </span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroOverlay isVisible={isContentLoaded} isMiniGameVisible={isMiniGameVisible} />
      {/* <AgendaTransitionOverlay /> */}
      <KeyboardScroll 
          onLoadComplete={() => setIsContentLoaded(true)} 
          onProgress={setLoadingProgress}
      />
      
      {/* Agenda Gallery Section */}
      <AgendaGallery />
      
      {/* Check-In Form Section */}
      <div id="check-in-form-section">
        <CheckInForm onSuccess={handleCheckInSuccess} />
      </div>

      {/* Mini Game Section */}
      <div ref={miniGameRef} className="min-h-screen relative">
        <MiniGameV2 />
      </div>
      
      {/* Outro Section */}
      <OutroScroll />
      
    </main>
  )
}
