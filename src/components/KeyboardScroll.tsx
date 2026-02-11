'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useScroll, useSpring, MotionValue, useMotionValue, useTransform, motion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'


const FRAME_COUNT = 240
const FRAME_PATH = '/hero-animation/{i}.webp'

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

  /* Parallax tilt removed */

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
      
      // No bleed needed without parallax
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
        const img = images[frameIndex]
        if (img && img.complete && texture.image !== img) {
            texture.image = img
            texture.needsUpdate = true
        }
    }
    
    // "Enter" Transition Effect (Zoom In)
    // Camera is at Z=5. We move mesh from Z=0 towards Z=10 to pass through.
    if (progress > 0.75) {
        // Normalize progress for the last 25% of scroll (Extended for smoothness)
        const zoomStart = 0.75
        const zoomEnd = 1.0
        const t = Math.max(0, (progress - zoomStart) / (zoomEnd - zoomStart))
        
        // Quartic ease in for a very smooth start and dramatic "warp" finish
        const easeT = t * t * t * t
        
        // Move Z towards and past the camera (at Z=5)
        meshRef.current.position.z = THREE.MathUtils.lerp(0, 10, easeT)
    } else {
        meshRef.current.position.z = 0
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeSize[0], planeSize[1]]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  )
}

export default function KeyboardScroll({ onLoadComplete }: { onLoadComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [loadingProgress, setLoadingProgress] = useState(0)
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

  // Wipe transition removed
  // Fade out removed

  // Optimized progressive image loading
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = new Array(FRAME_COUNT)
    let loadedCount = 0
    const INITIAL_LOAD_COUNT = 20 // Show experience after first 20 frames

    const updateProgress = (isInitialBatch = false) => {
      loadedCount++
      setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100))
      
      // Only show experience when ALL frames are loaded
      if (loadedCount === FRAME_COUNT) {
        setIsLoaded(true)
        onLoadComplete?.()
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
      // Priority load: First 20 frames to start experience quickly
      console.log('Loading initial frames...')
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
      console.log('All frames loaded')
    }

    preloadImages()
    setImages(loadedImages)
  }, [])

  /* Parallax tilt removed for Overlay */
  
  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full" style={{ willChange: 'transform' }}>
        {isLoaded && (
          <div className="absolute inset-0 z-20 pointer-events-none">
             {/* Overlay moved to page root */}
          </div>
        )}
        
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
             {/* Loading UI */}
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="mt-4 text-white font-mono text-sm">Loading Experience {loadingProgress}%</p>
          </div>
        )}
      </div>
    </div>
  )
}
