'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

export default function AgendaGallery() {
  const containerRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const agendaItems = [
    { src: '/agenda/4.png', title: 'CHECK IN', time: '14:00 - 14:45', description: 'Welcoming guests, registration, and networking.' },
    { src: '/agenda/5.png', title: 'THE FIRST SKETCH', time: '14:45 - 15:00', description: 'Opening remarks and setting the stage for the journey.' },
    { src: '/agenda/6.png', title: 'FINDING THE MUSE', time: '15:00 - 15:10', description: 'Discovering the inspiration behind the innovation.' },
    { src: '/agenda/7.png', title: 'THE NEW CANVAS', time: '15:10 - 15:30', description: 'Unveiling the new product and its core features.' },
    { src: '/agenda/8.png', title: 'THE SACRED VOW', time: '15:30 - 15:45', description: 'Commitment to quality and customer satisfaction.' },
    { src: '/agenda/9.png', title: 'MASTERPIECE CREATORS', time: '15:45 - 16:00', description: 'Meet the team behind the vision.' },
    { src: '/agenda/4.png', title: 'THE ART OF TOUCH', time: '16:00 - 18:00', description: 'Hands-on experience and interactive sessions.' },
    { src: '/agenda/5.png', title: 'THE LIVING PORTRAIT', time: '18:00 - 18:30', description: 'Closing remarks and farewell.' },
  ]

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current

    if (!container || !track) return

    const totalSlides = agendaItems.length

    // Create the horizontal scroll animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        snap: {
          snapTo: 1 / (totalSlides - 1),
          duration: { min: 0.2, max: 0.5 },
          delay: 0,
          ease: 'power1.inOut'
        }
      },
    })

    // Move the entire track to the left
    tl.to(track, {
      xPercent: -((totalSlides - 1) * 100) / totalSlides,
      ease: 'none',
      duration: 1,
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [agendaItems.length])

  return (
    <section
      ref={containerRef}
      className="agenda-gallery-section relative w-full"
      style={{ height: `${agendaItems.length * 100}vh` }}
    >
      {/* Sticky viewport */}
      <div
        ref={viewportRef}
        className="sticky top-0 w-full h-screen overflow-hidden"
      >
        {/* Horizontal track - moves with scroll */}
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
          style={{ width: `${agendaItems.length * 100}vw` }}
        >
          {agendaItems.map((item, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-screen h-full"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index < 2}
              />

              {/* Centered Title and Description */}
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div className="text-center px-4 md:px-8 bg-black/20 backdrop-blur-[1px] p-6 md:p-10 rounded-xl border border-white/5">
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4 tracking-tight uppercase"
                    style={{
                      textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {item.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="text-xl md:text-2xl lg:text-3xl text-white/90 tracking-widest font-mono"
                    style={{
                      textShadow: '0 2px 15px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    {item.time}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="text-base md:text-lg text-white/80 font-light max-w-2xl leading-relaxed mt-2 font-[family-name:var(--font-inter-tight)]"
                    style={{
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    {item.description}
                  </motion.p>
                </div>
              </div>

              {/* Female statue - Left side (even indices: 0, 2, 4...) */}
              {index % 2 === 0 && (
                <div className="absolute -left-50 -bottom-10 z-50 pointer-events-none h-[80vh] md:h-[95vh]">
                  <Image
                    src="/agenda/female-1.png"
                    alt="Female statue"
                    width={400}
                    height={900}
                    className="object-contain h-full w-auto"
                    priority
                  />
                </div>
              )}

              {/* Male statue - Right side (odd indices: 1, 3, 5...) */}
              {index % 2 === 1 && (
                <div className="absolute -left-50 -bottom-10 z-50 pointer-events-none h-[80vh] md:h-[95vh]">
                  <Image
                    src="/agenda/male-1.png"
                    alt="Male statue"
                    width={400}
                    height={900}
                    className="object-contain h-full w-auto"
                    priority
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
