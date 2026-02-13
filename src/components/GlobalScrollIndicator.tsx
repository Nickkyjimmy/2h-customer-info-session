'use client'

import { motion } from 'framer-motion'

export default function GlobalScrollIndicator({ isParentLoaded = true }: { isParentLoaded?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isParentLoaded ? 1 : 0, 
        y: 0,
        pointerEvents: isParentLoaded ? 'auto' : 'none'
      }}
      transition={{ 
        opacity: { duration: 0.5 },
        y: { duration: 0.8, delay: 1.0 } 
      }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none"
    >
      <span className="text-white/40 uppercase text-[10px] tracking-[0.2em] font-medium">Scroll to explore</span>
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1"
      >
        <div className="w-1 h-1 bg-white/60 rounded-full" />
      </motion.div>
    </motion.div>
  )
}
