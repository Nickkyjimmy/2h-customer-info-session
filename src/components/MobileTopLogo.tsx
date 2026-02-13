'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export default function MobileTopLogo({ isParentLoaded = true }: { isParentLoaded?: boolean }) {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: isParentLoaded && isScrolled ? 1 : 0, 
        y: isParentLoaded && isScrolled ? 0 : -20,
        pointerEvents: isParentLoaded && isScrolled ? 'auto' : 'none'
      }}
      transition={{ 
        opacity: { duration: 0.5 },
        y: { duration: 0.8 } 
      }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] md:hidden pointer-events-none flex flex-col items-center"
    >
      <div className="relative w-28 h-10">
        <Image 
          src="/customer-2h-logo.svg" 
          alt="Customer 2H Logo" 
          fill 
          className="object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        />
      </div>
      <div className="flex items-baseline gap-1 -mt-1 drop-shadow-md text-white">
        <span className="text-md font-bold uppercase tracking-[0.15em]">The New</span>
        <span className="font-[family-name:var(--font-dancing-script)] italic text-sm font-light">Era</span>
      </div>
    </motion.div>
  )
}
