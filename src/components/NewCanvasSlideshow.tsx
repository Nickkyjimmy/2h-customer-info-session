'use client'

import { useState } from 'react'
import { motion, AnimatePresence, MotionValue, useTransform, useMotionValue } from 'framer-motion'
import Image from 'next/image'

// SLIDES CONFIGURATION (Kept consistent with user edits)
const slides: { 
  id: number
  folder: string
  images: {
    name: string
    type: string
    customClass?: string
    initial?: any
    animate?: any
    transition?: any
  }[] 
}[] = [
  {
    id: 1,
    folder: 'slide1',
    images: [
      { 
        name: 'tablet-reward.png', 
        type: 'device',
        customClass: "absolute inset-0 w-full h-full object-contain z-0 origin-center",
        // These static anims are ignored by scroll logic below if targeted
        initial: { opacity: 0, scale: 1, x: -50 },
        animate: { opacity: 1, scale: 1.2, x: -120 , y: 80},
        transition: { duration: 0.8, ease: "easeOut" }
      },
      { 
        name: 'reward-popup.png', 
        type: 'popup',
        customClass: "absolute w-[50%] md:w-[40%] h-auto z-20 drop-shadow-2xl top-[45%] left-[30%] -translate-x-1/2 -translate-y-1/2",
        initial: { opacity: 0, scale: 0, x: -400, y: 200 }, 
        animate: { opacity: 1, scale: 1.6, x: 0, y: 20 },
        transition: { delay: 0.6, duration: 1, type: "spring", bounce: 0.5 }
      },
      { 
        name: 'customer2h-reward-logo.png', 
        type: 'logo',
        customClass: "absolute top-8 left-8 w-28 md:w-100 h-auto z-30 drop-shadow-md",
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 1.0, duration: 0.5 }
      },
    ]
  },
  {
    id: 2,
    folder: 'slide2',
    images: [
      { 
        name: 'mac-collabhub.png', 
        type: 'device',
        customClass: "absolute inset-0 w-full h-full object-contain z-0 origin-center",
        initial: { opacity: 0, scale: 1, x: -50 },
        animate: { opacity: 1, scale: 1.5, x: -200 , y: 50},
        transition: { duration: 0.8, ease: "easeOut" }
      },
      { 
        name: 'popup-collab-hub.png', 
        type: 'popup',
        // Copying Slide 1 style for consistency until user customizes
        customClass: "absolute w-[50%] md:w-[70%] h-auto z-20 drop-shadow-2xl top-[45%] left-[30%] -translate-x-1/2 -translate-y-1/2",
        initial: { opacity: 0, scale: 0, x: -400, y: 200 }, 
        animate: { opacity: 1, scale: 1.6, x: 0, y: 20 },
        transition: { delay: 0.6, duration: 1, type: "spring", bounce: 0.5 }
      },
      { name: 'logo-collabhub.png', type: 'logo', customClass: "absolute top-8 left-8 w-28 md:w-95 h-auto z-30 drop-shadow-md" },
    ]
  },
  {
    id: 3,
    folder: 'slide3',
    images: [
      { 
        name: 'mac-new-era.png', 
        type: 'device',
        customClass: "absolute inset-0 w-full h-full object-contain z-0 origin-center",
        initial: { opacity: 0, scale: 1, x: -50 },
        animate: { opacity: 1, scale: 1.3, x: -100 , y: 100},
        transition: { duration: 0.8, ease: "easeOut" }
      },
      { 
        name: 'popup-the-new-era.png', 
        type: 'popup',
        customClass: "absolute w-[50%] md:w-[50%] h-auto z-20 drop-shadow-2xl top-[45%] left-[30%] -translate-x-1/2 -translate-y-1/2",
        initial: { opacity: 0, scale: 0, x: -400, y: 200 }, 
        animate: { opacity: 1, scale: 1.3, x: 0, y: 20 },
        transition: { delay: 0.6, duration: 1, type: "spring", bounce: 0.5 }
      },
      { name: 'logo-new-era.png', type: 'logo', customClass: "absolute top-8 left-8 w-28 md:w-95 h-auto z-30 drop-shadow-md" },
    ]
  }
]

export default function NewCanvasSlideshow({ scrollYProgress }: { scrollYProgress?: MotionValue<number> }) {
  const fallbackScroll = useMotionValue(0)
  const scroll = scrollYProgress || fallbackScroll

  // Global Section Range: 3/8 -> 4/8 (approx 0.375 -> 0.5)
  // We divide this into 3 segments for 3 slides.
  const sectionStart = 3 / 8
  const sectionEnd = 4 / 8
  const duration = sectionEnd - sectionStart
  const perSlide = duration / 3

  return (
    <div className="relative w-full h-[300px] md:h-full flex items-center justify-center">
      {slides.map((slide, index) => {
        // Define active range for this slide
        const start = sectionStart + index * perSlide
        const end = start + perSlide
        
        // Progress 0->1 within this slide's duration
        const slideProgress = useTransform(scroll, [start, end], [0, 1])
        
        // Visibility: Fade In -> Hold -> Fade Out
        // Fade in first 10%, Fade out last 10%
        const fadeInEnd = start + perSlide * 0.1
        const fadeOutStart = end - perSlide * 0.1
        
        // For first slide, maybe start visible if coming from top? 
        // But usually we want scroll trigger.
        // Let's stick to standard fade in/out for smooth sequence.
        const opacity = useTransform(scroll, 
             [start, fadeInEnd, fadeOutStart, end], 
             [0, 1, 1, 0]
        )
        
        // Pointer events logic: Only active when visible?
        const pointerEvents = useTransform(opacity, (v) => v > 0.5 ? 'auto' : 'none')

        return (
           <motion.div
              key={slide.id}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity, pointerEvents }}
           >
              {slide.images.map((img) => {
                  const path = `/new-canvas/${slide.folder}/${img.name}`
                  
                  // Default styling
                  let className = "object-contain"
                  if (img.customClass) className = img.customClass
                  else {
                      // Fallback classes from previous logic
                      if (img.type === 'device') className = "absolute inset-0 w-full h-full object-contain z-0"
                      else if (img.type === 'popup') className = "absolute w-[80%] md:w-[60%] h-auto z-20 drop-shadow-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      else if (img.type === 'logo') className = "absolute top-4 left-4 w-24 md:w-32 h-auto z-30 drop-shadow-md"
                      else if (img.type === 'logo-secondary') className = "absolute top-4 right-4 w-24 md:w-32 h-auto z-30 drop-shadow-md opacity-80"
                  }

                  // === ANIMATION LOGIC ===
                  let styleStr: any = (img.type === 'device' ? { objectFit: 'contain' } : {})
                  
                  // Device Scaling/Translation Logic
                  if (img.type === 'device') {
                      // Get target values from config or defaults
                      const targetScale = img.animate?.scale || 1.3
                      const startScale = img.initial?.scale || 1
                      
                      const sMap = useTransform(slideProgress, [0, 1], [startScale, targetScale])
                      styleStr.scale = sMap
                      
                      // Apply X/Y if defined in animate config
                      // Default to 0 movement if not specified
                      if (img.animate?.x !== undefined || img.initial?.x !== undefined) {
                           const targetX = img.animate?.x ?? 0
                           const startX = img.initial?.x ?? 0
                           const xMap = useTransform(slideProgress, [0, 1], [startX, targetX])
                           styleStr.x = xMap
                      }
                      
                      if (img.animate?.y !== undefined || img.initial?.y !== undefined) {
                           const targetY = img.animate?.y ?? 0
                           const startY = img.initial?.y ?? 0
                           const yMap = useTransform(slideProgress, [0, 1], [startY, targetY])
                           styleStr.y = yMap
                      }
                  }

                  // 2. Popup Animation (Slide 1 logic applied to all popups)
                  if (img.type === 'popup') {
                        // "Same as Slide 1": Start Center (offsets 15%, 5%), Move to End (-150px, 20px).
                        // Scale 0 -> 1.6
                        const pScale = useTransform(slideProgress, [0, 1], [0, 1.6])
                        
                        const pX = useTransform(slideProgress, [0, 1], ["15%", "-150px"])
                        const pY = useTransform(slideProgress, [0, 1], ["5%", "20px"])
                        styleStr.scale = pScale
                        styleStr.x = pX
                        styleStr.y = pY
                  }

                  return (
                      <motion.div 
                          key={img.name}
                          className={img.type === 'device' ? "absolute inset-0" : "absolute inset-0 flex items-center justify-center pointer-events-none"}
                          // Apply computed styles
                          style={styleStr}
                      >
                           <Image
                              src={path}
                              alt={img.name}
                              width={800}
                              height={600}
                              className={className}
                              style={img.type === 'device' ? { objectFit: 'contain' } : undefined}
                           />
                      </motion.div>
                  )
              })}
           </motion.div>
        )
      })}
    </div>
  )
}
