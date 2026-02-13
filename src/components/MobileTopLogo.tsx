'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function MobileTopLogo({ isParentLoaded = true }: { isParentLoaded?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: isParentLoaded ? 1 : 0, 
        y: isParentLoaded ? 0 : -20,
        pointerEvents: isParentLoaded ? 'auto' : 'none'
      }}
      transition={{ 
        opacity: { duration: 0.5 },
        y: { duration: 0.8, delay: 0.5 } 
      }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] md:hidden pointer-events-none"
    >
      <div className="relative w-28 h-10">
        <Image 
          src="/customer-2h-logo.svg" 
          alt="Customer 2H Logo" 
          fill 
          className="object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        />
      </div>
    </motion.div>
  )
}
