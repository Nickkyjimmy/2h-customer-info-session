'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function HeroOverlay({ 
  isVisible, 
  isMiniGameVisible = false,
  activeIndex = 0
}: { 
  isVisible: boolean; 
  isMiniGameVisible?: boolean; 
  activeIndex?: number;
}) {
  const { scrollY } = useScroll()
  const [activeId, setActiveId] = useState('')
  const [hasTransitioned, setHasTransitioned] = useState(false)
  const [isPastGallery, setIsPastGallery] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Sync activeId with activeIndex prop
  useEffect(() => {
    if (agendaList[activeIndex]) {
      setActiveId(agendaList[activeIndex].id)
    }
  }, [activeIndex])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Scroll-based transition effect
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50 && !hasTransitioned) {
      setHasTransitioned(true)
    } else if (latest <= 50 && hasTransitioned) {
      setHasTransitioned(false)
    }
  })

  const agendaList = [
      { id: 'I', title: 'CHECK IN' },
      { id: 'II', title: 'THE FIRST SKETCH' },
      { id: 'III', title: 'FINDING THE MUSE' },
      { id: 'IV', title: 'THE NEW CANVAS' },
      { id: 'V', title: 'THE SACRED VOW' },
      { id: 'VI', title: 'MASTERPIECE CREATORS' },
      { id: 'VII', title: 'THE ART OF TOUCH' },
      { id: 'VIII', title: 'THE LIVING PORTRAIT' },
  ]

  // Weights must match AgendaGallery logic: Index 3 (NEW CANVAS) is 6x
  const weights = agendaList.map((_, i) => i === 3 ? 6 : 1)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  
  const ranges = weights.map((w, i) => {
      let start = 0
      for(let j=0; j<i; j++) start += weights[j]
      const end = start + w
      return [start / totalWeight, end / totalWeight]
  })

  // Scroll to section handler
  const scrollToSection = (index: number) => {
      const heroHeight = window.innerHeight * 6 
      // Total height matches AgendaGallery total weight * 100vh
      const galleryHeight = totalWeight * window.innerHeight 
      const scrollableDistance = galleryHeight - window.innerHeight
      
      const [startRatio] = ranges[index]
      
      const targetY = heroHeight + startRatio * scrollableDistance + 5
      window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  // Track scroll to determine visibility of Table of Contents
  useMotionValueEvent(scrollY, "change", (latest) => {
      if (typeof window === 'undefined') return
      
      const heroHeight = window.innerHeight * 6
      const galleryHeight = totalWeight * window.innerHeight
      const galleryEnd = heroHeight + galleryHeight

      // Hide TOC if we've scrolled past the gallery
      if (latest > galleryEnd - window.innerHeight) {
        if (!isPastGallery) setIsPastGallery(true)
      } else {
        if (isPastGallery) setIsPastGallery(false)
      }
  })

  if (!isVisible) return null

  // Variants for auto-transition
  const titleVariants = {
    initial: { x: '0px', y: '-20px', scale: 1, opacity: 1, pointerEvents: 'auto' as const },
    final: isMobile 
      ? { x: '0px', y: '-40vh', scale: 0.7, opacity: 1, pointerEvents: 'auto' as const, transition: { duration: 1.5, ease: "easeOut" } as const }
      : { x: '-28vw', y: '-22vh', scale: 0.85, opacity: 1, pointerEvents: 'auto' as const, transition: { duration: 1.5, ease: "easeOut" } as const },
    hidden: { opacity: 0, pointerEvents: 'none' as const, transition: { duration: 0.5 } }
  }

  const contentVariants = {
    initial: { x: '0px', y: '-20px', scale: 1, opacity: 1, pointerEvents: 'auto' as const },
    final: isMobile
      ? { opacity: 0, pointerEvents: 'none' as const, transition: { duration: 0.5 } as const }
      : { x: '-28vw', y: '18vh', scale: 0.85, opacity: 1, pointerEvents: 'auto' as const, transition: { duration: 1.5, ease: "easeOut" } as const },
    hidden: { opacity: 0, pointerEvents: 'none' as const, transition: { duration: 0.5 } }
  }

  const opacityVariantsInitial = {
    initial: { opacity: 1 },
    final: { opacity: 0, transition: { duration: 1 } }
  }

  const opacityVariantsFinal = {
    initial: { opacity: 0 },
    final: { opacity: 1, transition: { duration: 1 } }
  }

  const isOverlayClickable = !isPastGallery && !isMiniGameVisible
  const pointerEventsInitial = (hasTransitioned || !isOverlayClickable) ? 'none' : 'auto'
  const pointerEventsFinal = (!hasTransitioned || !isOverlayClickable) ? 'none' : 'auto'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Container to hold centered position initially */}
      <div className="relative w-[min(85vw,360px)] h-[min(70vh,480px)] flex flex-col justify-between">
         
         {/* Background Card - Fades out on scroll */}
         <motion.div 
            animate={{ opacity: hasTransitioned ? 0 : 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 border border-white/60 bg-black/5 backdrop-blur-sm shadow-2xl z-0"
         >
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/50 to-transparent" />
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <div className="absolute inset-4 border-[0.5px] border-white/20" />
            </div>
         </motion.div>

        {/* Top Section: Title & Changing Text */}
        <motion.div 
          initial="initial"
          animate={hasTransitioned ? "final" : "initial"}
          variants={titleVariants}
          className="relative z-10 p-5 md:p-6 origin-top-left cursor-pointer transition-opacity"
          transition={{ duration: 1.5, ease: "easeOut" }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="flex flex-col gap-6 mt-5">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={cn(
                "font-bold tracking-tighter text-white leading-[0.9]",
                isMobile ? "text-center" : "text-left"
              )}
            >
              <div className={cn(
                "relative w-[clamp(10rem,40vw,12rem)] h-12 mb-2 ",
                isMobile ? "mx-auto" : ""
              )}>
                <Image 
                  src="/customer-2h-logo.svg" 
                  alt="Customer 2H Logo" 
                  fill 
                  className={cn(
                    "object-contain",
                    isMobile ? "object-center" : "object-left"
                  )}
                />
              </div>
              <span className="text-[clamp(1.25rem,4.5vw,1.75rem)]">The </span>
              <br />
              <span className="text-[clamp(1.25rem,4.5vw,1.75rem)]">New </span>
              <span className="font-[family-name:var(--font-dancing-script)] italic font-light text-[clamp(1.5rem,6vw,2.25rem)]">era</span>
            </motion.h1>

             {/* Swappable Subtitle */}
             <div className="relative mt-4 h-[clamp(25px,5vw,40px)]">
                 {/* Initial Text */}
                 <motion.div 
                    initial="initial"
                    animate={hasTransitioned ? "final" : "initial"}
                    variants={opacityVariantsInitial}
                    style={{ pointerEvents: pointerEventsInitial }}
                    className="absolute inset-0"
                 >
                    <p className="text-[clamp(0.75rem,2.5vw,1rem)] text-white/90 font-extrabold leading-snug">
                       Sự kiện ra mắt chính thức chương trình Customer 2H
                    </p>
                 </motion.div>
                 
                 {/* Final Text (Scroll) */}
                 <motion.div 
                    initial="initial"
                    animate={hasTransitioned ? "final" : "initial"}
                    variants={opacityVariantsFinal}
                    style={{ pointerEvents: pointerEventsFinal }}
                    className="absolute inset-0"
                 >
                    {/* Text removed as requested */}
                 </motion.div>
             </div>
          </div>
        </motion.div>

        {/* Bottom Section - Event Details <=> Agenda List */}
        <motion.div 
           initial="initial"
           animate={isPastGallery || isMiniGameVisible ? "hidden" : (hasTransitioned ? "final" : "initial")}
           variants={contentVariants}
           className="relative z-10 p-5 md:p-6 origin-bottom-left"
           transition={{ duration: isMiniGameVisible ? 0.5 : 1.5, ease: "easeOut" }}
        >
          {/* Container for swapping bottom content */}
          <div className="relative">
              
              {/* Initial: Time & Location */}
              <motion.div 
                initial="initial"
                animate={hasTransitioned ? "final" : "initial"}
                variants={opacityVariantsInitial}
                style={{ pointerEvents: pointerEventsInitial }}
                className="flex flex-col gap-4 text-white/80 text-sm"
              >
                 <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="border-l-2 border-white/30 pl-4 "
                 >
                    <p className="uppercase text-[clamp(0.5rem,1.2vw,0.6rem)] tracking-widest text-white/50 mb-1 font-semibold">Thời gian</p>
                    <p className="font-medium text-[clamp(0.7rem,2vw,0.9rem)] text-white">14:00 - 16:00</p>
                    <p className="opacity-80 text-[clamp(0.6rem,1.5vw,0.75rem)]">26/02/2026</p>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="border-l-2 border-white/30 pl-4 py-1"
                 >
                    <p className="uppercase text-[clamp(0.5rem,1.2vw,0.6rem)] tracking-widest text-white/50 mb-1 font-semibold">Địa điểm</p>
                    <p className="font-medium text-[clamp(0.7rem,2vw,0.9rem)] text-white">Văn Phòng MoMo, Sảnh lầu 6,</p>
                    <p className="opacity-80 text-[clamp(0.6rem,1.5vw,0.75rem)]">Tòa nhà Phú Mỹ Hưng, Hồ Chí Minh</p>
                 </motion.div>
              </motion.div>

              {/* Final: Agenda List */}
              <motion.div 
                 initial="initial"
                 animate={hasTransitioned ? "final" : "initial"}
                 variants={opacityVariantsFinal}
                 style={{ pointerEvents: pointerEventsFinal }}
                 className="absolute bottom-10 left-0 w-full md:w-[420px] flex flex-col gap-0.5 text-white"
              >
                  <h3 className="text-[clamp(0.6rem,1.8vw,0.9rem)] font-bold mb-4 uppercase tracking-widest text-white/50">Event Agenda</h3>
                  {agendaList.map((item, i) => {
                      const isActive = activeId === item.id
                      return (
                          <motion.div 
                             key={item.id} 
                             onClick={(e) => {
                                 e.stopPropagation()
                                 scrollToSection(i)
                             }}
                             className="flex items-center justify-between w-full group cursor-pointer py-0.5"
                             style={{ pointerEvents: pointerEventsFinal }}
                             initial="hidden"
                             animate={isActive ? "visible" : "hidden"}
                             whileHover="visible"
                          >
                              <span className="font-bold tracking-tight uppercase text-[clamp(0.6rem,1.8vw,0.85rem)] leading-none text-white whitespace-nowrap z-10">
                                  {item.title}
                              </span>
                              
                              {/* Dashed Leader - Animated Drawing */}
                              <div className="flex-grow mx-3 h-[2px] relative flex items-center overflow-hidden">
                                  <motion.div 
                                      className="w-full h-full border-b-2 border-dotted border-white/60"
                                      variants={{
                                        hidden: { scaleX: 0, opacity: 0 },
                                        visible: { scaleX: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
                                      }}
                                      style={{ originX: 0 }}
                                  />
                              </div>
                              
                              <span className={`font-serif italic text-[clamp(0.5rem,1.5vw,0.7rem)] transition-colors duration-300 z-10 ${isActive ? 'text-white font-semibold' : 'text-white/30 group-hover:text-white/60'}`}>
                                  {item.id}
                              </span>
                          </motion.div>
                      )
                  })}
              </motion.div>

          </div>
        </motion.div>

      </div>
    </div>
  )
}
