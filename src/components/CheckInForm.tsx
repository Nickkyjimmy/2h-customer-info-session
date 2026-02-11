'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function CheckInForm() {
  const [domain, setDomain] = useState('')
  const [questions, setQuestions] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ domain, questions })
    // Handle form submission
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-end overflow-hidden">
      {/* Background Image */}
      <Image
        src="/agenda/11.png"
        alt="Renaissance Gallery"
        fill
        className="object-cover"
        priority
      />
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-100 w-full max-w-xl mr-4 md:mr-12 lg:mr-20"
      >
        {/* Renaissance Frame Border */}
        <div className="relative">
          {/* Frame Image as Border - extends beyond content */}
          <div className="absolute -inset-16 md:-inset-20 pointer-events-none z-0">
            <Image
              src="/frame.png"
              alt="Renaissance Frame"
              fill
              className="object-fill"
              style={{ 
                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))'
              }}
            />
          </div>

          {/* Form Content - with padding to avoid frame edges */}
          <div className="relative z-10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md p-12 md:p-16 m-4">
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-center mb-3 text-amber-100 tracking-tight"
              style={{
                fontFamily: 'var(--font-dancing-script)',
                textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
              }}
            >
              Check-In Online
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center text-sm md:text-base text-amber-200/70 mb-8 font-serif italic"
            >
              Share your wisdom and inquiries with us
            </motion.p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
              <div className="mx-3 w-2 h-2 rotate-45 border border-amber-500/50" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Domain Input */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <label 
                  htmlFor="domain" 
                  className="block text-sm font-serif text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 text-amber-50 placeholder-amber-900/50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 font-serif
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  style={{
                    borderColor: '#D42A87'
                  }}
                  placeholder="Enter your domain..."
                  required
                />
              </motion.div>

              {/* Questions Textarea */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label 
                  htmlFor="questions" 
                  className="block text-sm font-serif text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Leave Your Questions
                </label>
                <textarea
                  id="questions"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 text-amber-50 placeholder-amber-900/50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 resize-none font-serif
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  style={{
                    borderColor: '#D42A87'
                  }}
                  placeholder="Share your thoughts and questions..."
                  required
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="pt-4"
              >
                <button
                  type="submit"
                  className="w-full relative group overflow-hidden"
                >
                  {/* Button border frame */}
                  <div className="absolute inset-0 p-[2px]" style={{ background: '#D42A87' }}>
                    <div className="absolute inset-0 group-hover:brightness-110 transition-all duration-500" 
                         style={{ background: '#D42A87' }} />
                  </div>
                  
                  {/* Button content */}
                  <span className="relative block px-8 py-4 text-lg font-bold text-amber-50 tracking-widest uppercase
                                 font-serif group-hover:text-white transition-colors duration-300
                                 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                    Submit
                  </span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                  transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] 
                                  transition-transform duration-1000" />
                  </div>
                </button>
              </motion.div>
            </form>

            {/* Bottom decorative element */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rotate-45 bg-amber-600/30 border border-amber-500/50" />
                <div className="w-2 h-2 rotate-45 bg-amber-600/50 border border-amber-500/70" />
                <div className="w-2 h-2 rotate-45 bg-amber-600/30 border border-amber-500/50" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
