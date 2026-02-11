'use client'

import { useEffect, useRef } from 'react'
import { initAgendaTransition } from '@/utils/agendaTransitionScript'

export default function AgendaTransitionOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const agendaSection = document.querySelector('.agenda-gallery-section')

    if (!canvas || !agendaSection) {
      console.warn('Canvas or agenda section not found for transition')
      return
    }

    // Initialize the transition effect
    const cleanup = initAgendaTransition(canvas, agendaSection as HTMLElement)

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-screen pointer-events-none z-[60]"
      style={{
        mixBlendMode: 'normal'
      }}
    />
  )
}
