'use client'

import { useState } from 'react'
import { motion, useTransform, useScroll, useMotionValueEvent, useSpring } from 'framer-motion'

export default function HeroOverlay({ isVisible, isMiniGameVisible = false }: { isVisible: boolean; isMiniGameVisible?: boolean }) {
  const { scrollY } = useScroll()
  const [activeId, setActiveId] = useState('')
  
  // Smooth scroll sync with KeyboardScroll
  const smoothScrollY = useSpring(scrollY, {
      mass: 0.5,
      damping: 20,
      stiffness: 45,
      restDelta: 0.0001
  })

  // Title Animation: Moves up and to the left (adjusted for better positioning)
  const xTitle = useTransform(smoothScrollY, [0, 600], ['0px', '-28vw'])
  const yTitle = useTransform(smoothScrollY, [0, 600], ['0px', '-22vh'])
  const scaleTitle = useTransform(smoothScrollY, [0, 600], [1, 0.85])
  
  // Content/TOC Animation: Moves down and to the left (moved up to show full agenda)
  const xContent = useTransform(smoothScrollY, [0, 600], ['0px', '-28vw'])
  const yContent = useTransform(smoothScrollY, [0, 600], ['0px', '18vh'])
  const scaleContent = useTransform(smoothScrollY, [0, 600], [1, 0.85])

  // Content Crossfade
  const opacityInitial = useTransform(smoothScrollY, [200, 400], [1, 0])
  const opacityFinal = useTransform(smoothScrollY, [200, 400], [0, 1])
  const pointerEventsInitial = useTransform(smoothScrollY, (v) => v > 300 ? 'none' : 'auto')
  const pointerEventsFinal = useTransform(smoothScrollY, (v) => v > 300 ? 'auto' : 'none')

  // Fade out card background/borders immediately on scroll
  const cardOpacity = useTransform(smoothScrollY, [0, 200], [1, 0])

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

  // Scroll to section handler
  const scrollToSection = (index: number) => {
      const heroHeight = window.innerHeight * 3 // 300vh hero
      const targetY = heroHeight + (index * window.innerHeight)
      window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  // Track scroll to determine active section
  useMotionValueEvent(scrollY, "change", (latest) => {
      if (typeof window === 'undefined') return
      
      const heroHeight = window.innerHeight * 3
      if (latest < heroHeight) {
          setActiveId('')
          return
      }

      // Calculate active index based on scroll position
      // We add half viewport height to trigger the next slide when it's mostly visible
      const galleryScroll = latest - heroHeight + (window.innerHeight / 2)
      const index = Math.floor(galleryScroll / window.innerHeight)
      const safeIndex = Math.min(Math.max(0, index), agendaList.length - 1)
      setActiveId(agendaList[safeIndex].id)
  })

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Container to hold centered position initially */}
      <div className="relative w-[340px] md:w-[420px] h-[560px] flex flex-col justify-between">
         
         {/* Background Card - Fades out on scroll */}
         <motion.div 
            style={{ opacity: cardOpacity }}
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
          style={{ x: xTitle, y: yTitle, scale: scaleTitle, willChange: 'transform' }}
          className="relative z-10 p-5 md:p-6 origin-top-left"
        >
          <div className="flex flex-col gap-6 mt-4">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold tracking-tighter text-white leading-[0.9]"
            >
              The <br />
              <span className="font-[family-name:var(--font-dancing-script)] italic font-light text-5xl md:text-6xl">New Era</span>
            </motion.h1>

             {/* Swappable Subtitle */}
             <div className="relative mt-4 h-[60px]">
                 {/* Initial Text */}
                 <motion.div 
                    style={{ opacity: opacityInitial, pointerEvents: pointerEventsInitial }}
                    className="absolute inset-0"
                 >
                    <p className="text-xl md:text-2xl text-white/90 font-extrabold leading-snug">
                       Sự kiện ra mắt chính thức chương trình Customer 2H
                    </p>
                 </motion.div>
                 
                 {/* Final Text (Scroll) */}
                 <motion.div 
                    style={{ opacity: opacityFinal, pointerEvents: pointerEventsFinal }}
                    className="absolute inset-0"
                 >
                    <p className="text-xl md:text-2xl text-white font-extrabold tracking-wider">
                       CUSTOMER 2H
                    </p>
                 </motion.div>
             </div>
          </div>
        </motion.div>

        {/* Bottom Section - Event Details <=> Agenda List */}
        <motion.div 
           style={{ x: xContent, y: yContent, scale: scaleContent, willChange: 'transform' }}
           className="relative z-10 p-5 md:p-6 origin-bottom-left"
           animate={{ opacity: isMiniGameVisible ? 0 : 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Container for swapping bottom content */}
          <div className="relative">
              
              {/* Initial: Time & Location */}
              <motion.div 
                style={{ opacity: opacityInitial, pointerEvents: pointerEventsInitial }}
                className="flex flex-col gap-6 text-white/80 text-sm"
              >
                 <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="border-l-2 border-white/30 pl-4 py-1"
                 >
                    <p className="uppercase text-xs tracking-widest text-white/50 mb-1 font-semibold">Thời gian</p>
                    <p className="font-medium text-base text-white">14:00 - 16:00</p>
                    <p className="opacity-80">26/02/2026</p>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="border-l-2 border-white/30 pl-4 py-1"
                 >
                    <p className="uppercase text-xs tracking-widest text-white/50 mb-1 font-semibold">Địa điểm</p>
                    <p className="font-medium text-base text-white">Sảnh lầu 6,</p>
                    <p className="opacity-80">Tòa nhà Phú Mỹ Hưng</p>
                 </motion.div>
              </motion.div>

              {/* Final: Agenda List */}
              <motion.div 
                 style={{ opacity: opacityFinal, pointerEvents: pointerEventsFinal }}
                 className="absolute bottom-0 left-0 w-[420px] flex flex-col gap-0.5 text-white"
              >
                  {agendaList.map((item, i) => {
                      const isActive = activeId === item.id
                      return (
                          <motion.div 
                             key={item.id} 
                             onClick={() => scrollToSection(i)}
                             className="flex items-center justify-between w-full group cursor-pointer py-0.5 pointer-events-auto"
                             initial="hidden"
                             animate={isActive ? "visible" : "hidden"}
                             whileHover="visible"
                          >
                              <span className="font-bold tracking-tight uppercase text-base md:text-lg leading-none text-white whitespace-nowrap z-10">
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
                              
                              <span className={`font-serif italic text-xs transition-colors duration-300 z-10 ${isActive ? 'text-white font-semibold' : 'text-white/30 group-hover:text-white/60'}`}>
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
