'use client'

import { motion } from 'framer-motion'

export default function HeroOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
    >
      {/* Small Floating Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="relative w-[340px] md:w-[400px] h-[520px] border border-white/60 bg-black/5 flex flex-col p-6 md:p-8 overflow-hidden backdrop-blur-sm shadow-2xl"
      >
        {/* Subtle Grid Lines and Border */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
             {/* Crosshairs */}
             <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/50 to-transparent" />
             <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
             
             {/* Inner Border Effect */}
             <div className="absolute inset-4 border-[0.5px] border-white/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          
          {/* Top Section: Title & Content */}
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

             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-4"
             >
                <p className="text-xl md:text-2xl text-white/90 font-extrabold leading-snug">
                   Sự kiện ra mắt chính thức chương trình Customer 2H
                </p>
                {/* <p className="text-white font-medium text-lg mt-2 tracking-wide font-[family-name:var(--font-geist-mono)]">CUSTOMER 2H</p> */}
             </motion.div>
          </div>

          {/* Bottom Section - Event Details */}
          <div className="mt-auto flex flex-col gap-6 text-white/80 text-sm mb-4">
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
                <p className="opacity-80">tòa nhà Phú Mỹ Hưng</p>
             </motion.div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}
