'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useScroll, useSpring, MotionValue, useTransform, motion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const FRAME_COUNT = 240
const FRAME_PATH = '/opening-animation/{i}.webp'

const Scene = ({ images, scrollYProgress }: { images: HTMLImageElement[], scrollYProgress: MotionValue<number> }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Shared texture to avoid memory leaks or constant recreation
  const texture = useMemo(() => {
     const t = new THREE.Texture()
     t.colorSpace = THREE.SRGBColorSpace
     t.minFilter = THREE.LinearFilter
     t.magFilter = THREE.LinearFilter
     t.generateMipmaps = false
     return t
  }, [])

  const { viewport } = useThree()
  
  // Calculate size to "cover" the viewport
  const planeSize = useMemo(() => {
      if (images.length === 0) return [1, 1] as [number, number]
      const img = images[0] // Assume all same size
      const imgAspect = img.width / img.height
      const viewAspect = viewport.width / viewport.height
      
      let w, h
      if (imgAspect > viewAspect) {
          // Image wider than viewport (relative to Aspect Ratio) -> Match Height to cover
          h = viewport.height
          w = h * imgAspect
      } else {
          // Image is taller/narrower -> Match Width to cover
          w = viewport.width
          h = w / imgAspect
      }
      
      return [w, h] as [number, number]
  }, [viewport, images])

  useFrame(() => {
    if (!meshRef.current) return

    // Update texture frame based on scroll
    const progress = scrollYProgress.get()
    
    if (images.length > 0) {
        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.floor(progress * (FRAME_COUNT - 1)))
        )
        const img = images[(FRAME_COUNT - 1) - frameIndex]
        if (img && img.complete && texture.image !== img) {
            texture.image = img
            texture.needsUpdate = true
        }
    }
    
    // Default position (no zoom effect)
    meshRef.current.position.z = 0
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeSize[0], planeSize[1]]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  )
}

export default function OutroScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.5,
    damping: 20,
    stiffness: 45,
    restDelta: 0.0001
  })

  // Optimized progressive image loading
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = new Array(FRAME_COUNT)
    let loadedCount = 0
    const INITIAL_LOAD_COUNT = 10 // Smaller initial load for outro since it's at the bottom

    const updateProgress = (isInitialBatch = false) => {
      loadedCount++
      // We don't need to report progress to main loader since this is at the bottom
      
      if (loadedCount === FRAME_COUNT) {
        setIsLoaded(true)
      }
    }

    const loadImage = async (index: number, isInitialBatch = false) => {
      const img = new Image()
      const paddedNumber = index.toString().padStart(5, '0')
      const path = FRAME_PATH.replace('{i}', paddedNumber)
      
      img.onload = async () => {
        try {
          await img.decode()
        } catch (e) {
          // Silent fail
        }
        updateProgress(isInitialBatch)
      }
      
      img.onerror = () => {
        console.error(`Failed to load frame ${index}`)
        updateProgress(isInitialBatch)
      }
      
      img.src = path
      loadedImages[index - 1] = img
    }

    const preloadImages = async () => {
      // Priority load: First batch
      const priorityPromises = []
      for (let i = 1; i <= INITIAL_LOAD_COUNT; i++) {
        priorityPromises.push(loadImage(i, true))
      }
      await Promise.all(priorityPromises)
      
      // Load remaining frames in background batches
      const batchSize = 30
      for (let i = INITIAL_LOAD_COUNT + 1; i <= FRAME_COUNT; i += batchSize) {
        const batchPromises = []
        for (let j = i; j < Math.min(i + batchSize, FRAME_COUNT + 1); j++) {
          batchPromises.push(loadImage(j, false))
        }
        // Small delay between batches to keep scrolling smooth
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    preloadImages()
    setImages(loadedImages)
  }, [])
  
  return (
    <div ref={containerRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ willChange: 'transform' }}>
        {isLoaded ? (
             <Canvas 
                gl={{ 
                    antialias: false, 
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: false
                }} 
                camera={{ position: [0, 0, 5], fov: 35 }}
                className="w-full h-full"
                dpr={[1, 1.5]}
                flat
            >
                <Scene images={images} scrollYProgress={smoothProgress} />
            </Canvas>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                {/* Optional: Simple loader for outro if user scrolls fast */}
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <OutroText scrollYProgress={smoothProgress} />
      </div>
    </div>
  )
}

function OutroText({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    // Fade out as we scroll down the outro
    // Visible at start (0), fades out by 30% scroll
    const opacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [0, 1, 0])
    const bgOpacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [0, 0.7, 0])
    const y = useTransform(scrollYProgress, [0, 0.3], [0, -50])
    const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

    return (
        <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Dark background overlay */}
            <motion.div 
                style={{ opacity: bgOpacity }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            />
            
            <motion.div 
                style={{ opacity, y, scale }}
                className="absolute inset-0 flex items-center justify-center px-6"
            >
                <div className="max-w-3xl text-center">
                    <p className="text-white/90 text-lg md:text-2xl font-light leading-relaxed mb-8">
                        Nhân ngày làm việc cuối năm <span className="font-bold text-white">Customer2H</span> chúc anh/chị một kỳ nghỉ hạnh phúc bên gia đình & một năm mới rực rỡ.
                    </p>
                    <div className="h-px w-24 bg-white/30 mx-auto mb-8" />
                    <h3 className="text-white text-xl md:text-3xl font-bold tracking-tight uppercase">
                        Hẹn gặp lại anh/chị vào 26.2
                    </h3>
                </div>
            </motion.div>
        </div>
    )
}
