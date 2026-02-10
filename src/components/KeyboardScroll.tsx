'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useScroll, useSpring, MotionValue, useMotionValue, useTransform, motion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import HeroOverlay from './HeroOverlay'

const FRAME_COUNT = 240
const FRAME_PATH = '/hero-animation/{i}.png'

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
    if (images.length > 0) {
        const progress = scrollYProgress.get()
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
    
    // No rotation update
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeSize[0], planeSize[1]]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  )
}

export default function KeyboardScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    damping: 20,
    stiffness: 100,
    restDelta: 0.001
  })

  // Preload all images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = []
    let loadedCount = 0

    const preloadImages = async () => {
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image()
        const paddedNumber = i.toString().padStart(5, '0')
        const path = FRAME_PATH.replace('{i}', paddedNumber)
        
        img.onload = async () => {
          try {
             await img.decode()
          } catch (e) {
             console.warn('Image decode failed', e)
          }
          loadedCount++
          setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100))
          if (loadedCount === FRAME_COUNT) setIsLoaded(true)
        }
        
        img.onerror = () => {
          console.error(`Failed to load frame ${i}`)
          loadedCount++
          setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100))
        }
        
        img.src = path
        loadedImages[i - 1] = img
      }
    }

    preloadImages()
    setImages(loadedImages)
  }, [])

  /* Parallax tilt removed for Overlay */
  
  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full bg-black">
        {isLoaded && (
          <div className="absolute inset-0 z-20 pointer-events-none">
             <HeroOverlay isVisible={true} />
          </div>
        )}
        {isLoaded ? (
             <Canvas 
                gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }} 
                camera={{ position: [0, 0, 5], fov: 35 }}
                className="w-full h-full"
                dpr={[1, 2]}
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
