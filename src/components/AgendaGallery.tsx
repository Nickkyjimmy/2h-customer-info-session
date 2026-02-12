'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils' 
import ThreeDSlider from './ThreeDSlider'
import NewCanvasSlideshow from './NewCanvasSlideshow'

// Helper for conditional classnames if cn util doesn't exist
const classNames = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')

export default function AgendaGallery() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Memoize agenda items to prevent reference churn
  const agendaItems = useMemo(() => [
    { src: '/agenda/4.png', title: 'CHECK IN', description: 'Welcoming guests, registration, and networking.' },
    { src: '/agenda/5.png', title: 'THE FIRST SKETCH', description: 'Opening remarks and setting the stage for the journey.' },
    { src: '/agenda/6.png', title: 'FINDING THE MUSE', description: 'Đừng để những biểu đồ vô cảm đánh lừa! Lắng nghe vị quân chủ với trái tim luôn hướng về người dùng giải thích tầm quan trọng của việc gặp gỡ "Nàng Muse" – người nắm giữ vận mệnh tính năng trước khi Nàng dỗi và bỏ đi tìm người khác.' },
    { src: '/agenda/7.png', title: 'THE NEW CANVAS', description: 'Khung tranh đã sẵn sàng, nhưng bạn cần "vũ khí" mới. Khám phá Collab Hub và "kho báu" Merch cùng những Thẻ bài bí ẩn. Vũ khí mới để các Artisans biến Insight mặn mòi thành hành động có thật. Vẽ đẹp là có quà!' },
    { src: '/agenda/8.png', title: 'THE SACRED VOW', description: 'Bản giao ước "nặng đô" hơn lời thề lễ đường. Đã hứa gặp User là phải đi, đừng làm "tra nam" trong truyền thuyết, tội người ta' },
    { src: '/agenda/9.png', title: 'MASTERPIECE CREATORS', description: 'Chiêm ngưỡng những "Idol" giới Customer 2H với kỷ lục thấu cảm User. Vào để học bí kíp hoặc đơn giản là để "GATO" lấy động lực thăng hạng.' },
    { src: '/agenda/4.png', title: 'THE ART OF TOUCH', description: 'Nói chuyện với User là một nghệ thuật, và người đặt câu hỏi không bị "quê" chính là một nghệ sĩ. Gặp gỡ chuyên gia sẽ giúp bạn "mở khóa" trái tim User không cần búa. Học cách hỏi sao cho "nghệ", thoát kiếp người lạ từng quen mỗi khi đối diện khách hàng.' },
    { src: '/agenda/5.png', title: 'THE LIVING PORTRAIT', description: 'Chạm vào Nàng Thơ. Đừng chỉ đứng xa ngắm nghía, hãy tiến tới "Chạm vào Nàng Thơ". Trực tiếp đối thoại để thấy User bằng xương bằng thịt còn drama hơn cả Data!' },
  ], [])

  // Data for the slider
  const specialSliderItems = useMemo(() => {
    const portraitImages = [
        'alchemist', 'artisan', 'grandmaster', 'joybringer', 
        'merchant', 'pathfinder', 'patron', 'reformer', 
        'strategist', 'visionary', 'voyager'
    ]
    return portraitImages.map((name, index) => ({
        title: name.charAt(0).toUpperCase() + name.slice(1),
        num: String(index + 1).padStart(2, '0'),
        imageUrl: `/liberty-of-portrait/${name}.png`
    }))
  }, [])

  const specialTitles = ['FINDING THE MUSE', 'THE ART OF TOUCH', 'THE LIVING PORTRAIT', 'THE NEW CANVAS']

  // Weights for scroll duration: 'THE NEW CANVAS' gets 3x duration
  const weights = useMemo(() => agendaItems.map(item => item.title === 'THE NEW CANVAS' ? 3 : 1), [agendaItems])
  const totalWeight = useMemo(() => weights.reduce((a, b) => a + b, 0), [weights])

  // Pre-calculate ranges to ensure stable tracking
  const ranges = useMemo(() => {
      let accum = 0
      return weights.map(w => {
          const start = accum
          const end = accum + w
          accum = end
          return [start / totalWeight, end / totalWeight]
      })
  }, [weights, totalWeight])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const [sliderProgress, setSliderProgress] = useState(50)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Find active index based on ranges
    const foundIndex = ranges.findIndex(([start, end]) => latest >= start && latest < end)
    const newIndex = foundIndex === -1 ? (latest >= 0.99 ? agendaItems.length - 1 : 0) : foundIndex

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }

    // specific logic for "THE LIVING PORTRAIT" (last item)
    if (newIndex === agendaItems.length - 1) {
       const [start, end] = ranges[newIndex]
       const raw = (latest - start) / (end - start)
       const clamped = Math.min(Math.max(raw, 0), 1)
       setSliderProgress(clamped * 100)
    }
  })
  
  // Range for New Canvas (Index 3)
  const newCanvasRange = ranges[3] || [0, 0]

  return (
    <section
      ref={containerRef}
      className="agenda-gallery-section relative w-full bg-black"
      // Height based on total weight
      style={{ height: `${totalWeight * 100}vh` }} 
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        
        {/* Carousel Container */}
        <div className="relative w-full h-full">
            <AnimatePresence mode="popLayout">
                {agendaItems.map((item, index) => index === activeIndex && (
                    <motion.div
                        key={index}
                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    >
                        {/* Background Image / Main Visual */}
                        <div className="absolute inset-0 z-0">
                           <div className="absolute inset-0 bg-black/20 z-10" /> {/* Overlay for readability */}
                           <Image
                                src={item.src}
                                alt={item.title}
                                fill
                                className="object-cover opacity-60"
                                priority
                           />
                        </div>

                        {/* Content Layer */}
                        <div className="relative z-40 w-full max-w-7xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                            
                            {/* Left Side: Text */}
                            <div className={cn(
                                "flex flex-col justify-center text-left space-y-6",
                                item.title === 'THE NEW CANVAS' ? "md:-ml-20 pl-6 z-50 relative" : "md:pl-10"
                            )}>
                                <motion.h2 
                                    className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]"
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                >
                                    {item.title}
                                </motion.h2>
                                <motion.p 
                                    className="text-lg md:text-xl text-white/80 font-light max-w-md leading-relaxed"
                                    initial={{ x: -30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                >
                                    {item.description}
                                </motion.p>
                            </div>

                            {/* Right Side: Visuals for Special Items */}
                            <div className="relative h-full flex items-center justify-center w-full">
                                {specialTitles.includes(item.title) && (
                                     <motion.div
                                        initial={{ opacity: 0, x: 50, rotate: 5 }}
                                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                        className={classNames(
                                            "relative",
                                            item.title === 'THE LIVING PORTRAIT' 
                                                ? "w-full h-[60vh]" // Wider container for slider
                                                : item.title === 'THE NEW CANVAS'
                                                    ? "w-full h-[40vh] md:w-full md:h-[70vh]"
                                                    : "w-[300px] h-[450px] md:w-[400px] md:h-[600px]"
                                        )}
                                     >
                                        {item.title === 'THE LIVING PORTRAIT' ? (
                                            <div className="w-full h-full">
                                                <ThreeDSlider items={specialSliderItems} progress={sliderProgress} />
                                            </div>
                                        ) : item.title === 'THE NEW CANVAS' ? (
                                            <NewCanvasSlideshow scrollYProgress={scrollYProgress} range={newCanvasRange} />
                                        ) : (
                                            <Image
                                                src={
                                                  item.title === 'FINDING THE MUSE' ? '/agenda/agenda-find-the-muse.png' :
                                                  '/agenda/agenda-the-art-of-touch.png'
                                                }
                                                alt={item.title}
                                                fill
                                                className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                                            />
                                        )}
                                     </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Statues (Decorations) */}
                        {index % 2 === 0 ? (
                            <motion.div 
                                className="absolute -left-10 bottom-0 z-0 md:z-50 pointer-events-none h-[60vh] md:h-[80vh] opacity-30 md:opacity-80"
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 0.8 }}
                                transition={{ duration: 1 }}
                            >
                                <Image
                                    src="/agenda/female-1.png"
                                    alt="Female statue"
                                    width={400}
                                    height={900}
                                    className="object-contain h-full w-auto"
                                    priority
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="absolute -right-10 bottom-0 z-0 md:z-50 pointer-events-none h-[60vh] md:h-[80vh] opacity-30 md:opacity-80"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 0.8 }}
                                transition={{ duration: 1 }}
                            >
                                <Image
                                    src="/agenda/male-1.png"
                                    alt="Male statue"
                                    width={400}
                                    height={900}
                                    className="object-contain h-full w-auto"
                                    priority
                                />
                            </motion.div>
                        )}

                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
