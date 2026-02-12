'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, MotionValue, useTransform, useMotionValue } from 'framer-motion'
import Image from 'next/image'

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
        // User's preferred tablet settings
        customClass: "absolute inset-0 w-full h-full object-contain z-0 origin-center",
        initial: { opacity: 0, scale: 1, x: -50 },
        animate: { opacity: 1, scale: 1.3, x: -120 , y: 80},
        transition: { duration: 0.8, ease: "easeOut" }
      },
      { 
        name: 'reward-popup.png', 
        type: 'popup',
        customClass: "absolute w-[50%] md:w-[50%] h-auto z-20 drop-shadow-2xl top-[45%] left-[30%] -translate-x-1/2 -translate-y-1/2",
        // These defaults will be overridden by scroll logic if active
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
      { name: 'mac-collabhub.png', type: 'device' },
      { name: 'logo-collabhub.png', type: 'logo', customClass: "absolute top-8 left-8 w-28 md:w-36 h-auto z-30 drop-shadow-md" },
      { name: 'logo-new-era.png', type: 'logo-secondary', customClass: "absolute top-8 right-8 w-24 md:w-32 h-auto z-30 drop-shadow-md opacity-90 transition-opacity duration-300 hover:opacity-100" }, 
    ]
  },
  {
    id: 3,
    folder: 'slide3',
    images: [
      { name: 'mac-new-era.png', type: 'device' },
      { 
        name: 'popup-the-new-era.png', 
        type: 'popup',
        customClass: "absolute w-[80%] md:w-[60%] h-auto z-20 drop-shadow-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      },
      { name: 'logo-new-era.png', type: 'logo', customClass: "absolute top-8 left-8 w-28 md:w-36 h-auto z-30 drop-shadow-md" },
    ]
  }
]

export default function NewCanvasSlideshow({ scrollYProgress }: { scrollYProgress?: MotionValue<number> }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Setup scroll transforms for Slide 1 Popup
  const fallbackScroll = useMotionValue(0)
  const scroll = scrollYProgress || fallbackScroll
  
  // "THE NEW CANVAS" is approx item 4 of 8. Range 3/8 to 4/8.
  // We want animation to complete by the middle specific to this section
  const start = 3 / 8
  const end = 3.6 / 8 // Finish animation well before section end
  
  // User edit wants final scale 1.5. 
  // User wants "start from center of tablet" -> Center of container.
  // Final pos (customClass) is left: 30%, top: 45%.
  // Center is left: 50%, top: 50%.
  // So Start offsets relative to Final:
  // X: 50% - 30% = +20% (approx, depends on translate centers).
  // Y: 50% - 45% = +5%.
  // User edit wants final scale 1.6. X: 0, Y: 20.
  const popupScale = useTransform(scroll, [start, end], [0, 1.6])
  // Using percentage strings for responsive centering
  // Start: 15%, 5% (from center). End: 0, 20px (user requested offset)
  const popupX = useTransform(scroll, [start, end], ["15%", "-150px"]) 
  const popupY = useTransform(scroll, [start, end], ["5%", "20px",])
  const popupOpacity = useTransform(scroll, [start, start + 0.02], [0, 1])

  return (
    <div className="relative w-full h-[300px] md:h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
           key={currentIndex}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 1.05 }}
           transition={{ duration: 0.8, ease: "easeInOut" }}
           className="absolute inset-0 flex items-center justify-center"
        >
           {/* Render Images for current slide */}
           {slides[currentIndex].images.map((img, i) => {
               const path = `/new-canvas/${slides[currentIndex].folder}/${img.name}`
               
               // Default styles
               let className = "object-contain"

               if (img.customClass) {
                   className = img.customClass
               } else {
                   // Fallback logic
                   if (img.type === 'device') {
                       className = "absolute inset-0 w-full h-full object-contain z-0"
                   } else if (img.type === 'popup') {
                       className = "absolute w-[80%] md:w-[60%] h-auto z-20 drop-shadow-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                   } else if (img.type === 'logo') {
                       className = "absolute top-4 left-4 w-24 md:w-32 h-auto z-30 drop-shadow-md"
                   } else if (img.type === 'logo-secondary') {
                       className = "absolute top-4 right-4 w-24 md:w-32 h-auto z-30 drop-shadow-md opacity-80"
                   }
               }
               
               // Determine props
               const isPopup = img.name === 'reward-popup.png'
               const finalStyle = (img.type === 'device' ? { objectFit: 'contain' } : undefined) as any

               let motionProps: any = {
                  initial: img.initial || { opacity: 0 },
                  animate: img.animate || { opacity: 1 },
                  transition: img.transition || { duration: 0.5 }
               }

               if (isPopup && scrollYProgress) {
                   // Override animation with scroll bound values
                   motionProps = {
                       style: {
                           scale: popupScale,
                           x: popupX,
                           y: popupY,
                           opacity: popupOpacity
                       }
                   }
               }

               return (
                   <motion.div 
                      key={img.name} 
                      className={img.type === 'device' ? "absolute inset-0" : "absolute inset-0 flex items-center justify-center pointer-events-none"}
                      {...motionProps}
                   >
                       <Image
                          src={path}
                          alt={img.name}
                          width={800}
                          height={600}
                          className={className}
                          style={finalStyle}
                       />
                   </motion.div>
               )
           })}
        </motion.div>
      </AnimatePresence>
      
      {/* Dots (Keep existing) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-40">
        {slides.map((_, idx) => (
          <div 
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/30'}`}
             onClick={() => setCurrentIndex(idx)}
             style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </div>
  )
}
